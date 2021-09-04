function convert() {
    //dummyConvert();
    //return;
    const input = document.getElementById("gabc").value;
    let output = "Lorem ipsum";
    try {
        parsedInput = gabcparser.parse(input);
        output = lilypondWriter(parsedInput);
    }
    catch (error) {
        //output = "Error";
        output = error.message;
    }
    document.getElementById("lilypond").value = output;
}

function dummyConvert() {
    const input = document.getElementById("gabc").value;
    let output = "Lorem ipsum";
    try {
        output = gabcparser.parse(input).toString();
    }
    catch (error) {
        output = "Error";
        //output = error.message;
    }
    document.getElementById("lilypond").value = output;
}

function lilypondWriter(parsedInput,transposition=0,title="",subtitle="",subsubtitle="",poet="",composer="",copyright="",tagline="") {
    const scoreAndLyrics = scoreAndLyricWriter(parsedInput.words);
    //TODO: add transposition
    let key = "c'"
    const scoreBraces = "\\score {\n  \\transpose c' "+key+" {\n    \\cadenzaOn\n    \\key c \\major\n    "
    const lyricsBraces = "\n  }\n  \\addlyrics {\n    "
    const endBraces = "\n  }\n}"
    
    let output = "";
//    output = scoreAndLyrics.toString();
    output += scoreBraces;
    output += scoreAndLyrics.notes.join(" ");
    output += lyricsBraces;
    output += scoreAndLyrics.lyrics.join(" ")
    output += endBraces;
    return output;
}

function scoreAndLyricWriter(words) {
    let outputNotes = [];
    let outputLyrics = [];
    let clef = null;
    clef = "c3";
    lPitch = new PitchConverter(clef);
    let iNeedABar = false;
    
    function printNote(gabcpitch) {
        return lPitch.lilypond(gabcpitch);
    }
    function printBar(gabcbar) {
//        TODO
        let s = "";
        switch (gabcbar) {
            case "::":
                s = '\\bar "||"';
                break;
            case ":":
                s = '\\bar "|"';
                break;
            case ";":
                s = '\\halfBar';
                break;
            case ",":
                s = '\\bar "\'"';
                break;
            default:
        }
        return s;
    }
    function setClef(gabcclef) {
        clef = gabcclef;
        lPitch.clef = clef;
    }
    function detectUppercase(note) {
//        maybe someday: diamond shape
        note.pitch = note.pitch.toLowerCase();
    }
    function fixLonelyText(t) {
        switch (t) {
            case null:
                break;
            case "*":
            case "**":
                t = "\\set stanza = \\markup {"+t+"}";
                break;
            default:
                outputNotes.push("\\once \\hideNotes b'4")
                t = "\\markup {"+t+"}";
        }
        return t;
    }
    
    words.forEach((word) => {
//        outputNotes.push("foo");
//        outputLyrics.push("bar");
        word.syllables.forEach((syllable,index,array) => {
            let t = syllable.text;
            if (index<array.length-1) { t += " --"; }
//            outputNotes.push("F");
            if (syllable.notes.length == 0) { t = fixLonelyText(t); }
            syllable.notes.forEach((note,index,array) => {
//                outputNotes.push(note.pitch);
                detectUppercase(note);
                let s = "";
                switch (note.pitch) {
                    case "bar":
                        s = printBar(note.mods[0]);
                        //remove preceding extra blank bar
                        const check = outputNotes.pop();
                        if (check!=='\\bar ""') {
                            outputNotes.push(check);
                        }
                        outputNotes.push(s);
                        //prevent following extra blank bar
                        iNeedABar = false;
                        //text on just a bar
                        t = fixLonelyText(t);
//                        if (t != null) { t = "\\set stanza = \\markup {"+t+"}"; }
                        //TODO: bar in the middle of a melisma
                        break;
                    case "clef":
                        setClef(note.mods[0]);
//                        s += note.mods[0];
                        iNeedABar = false;
                        break;
                    default:
                        s = printNote(note.pitch);
                        if (array.length > 1) {
                            switch (index) {
                                case 0:
                                    s += "64(";
                                    break;
                                case array.length-1:
                                    s += "4)";
                                    break;
                                default:
                                    s += "64";
                                    break;
                            }
                        } else { s += "4"; }
//                        note.mods.forEach((mod) => {
//                            switch (mod) {
//                                case "w":
//                            }
//                        })
                        outputNotes.push(s);
                        iNeedABar = true;
                }
//                outputNotes.push(s);
            })
            outputLyrics.push(t);
        })
        if (iNeedABar) { outputNotes.push('\\bar ""'); }
    })
    return {"notes":outputNotes,"lyrics":outputLyrics}
}

function PitchConverter(clef) {
    const converterTables = {
        "c4": {
            "a":"a",
            "b":"b",
            "c":"c'",
            "d":"d'",
            "e":"e'",
            "f":"f'",
            "g":"g'",
            "h":"a'",
            "i":"b'",
            "j":"c''",
            "k":"d''",
            "l":"e''",
            "m":"f''"
        },
        "c3": {
            "a":"c'",
            "b":"d'",
            "c":"e'",
            "d":"f'",
            "e":"g'",
            "f":"a'",
            "g":"b'",
            "h":"c''",
            "i":"d''",
            "j":"e''",
            "k":"f''",
            "l":"g''",
            "m":"a''"
        },
        "c2": {
            "a":"e'",
            "b":"f'",
            "c":"g'",
            "d":"a'",
            "e":"b'",
            "f":"c''",
            "g":"d''",
            "h":"e''",
            "i":"f''",
            "j":"g''",
            "k":"a''",
            "l":"b''",
            "m":"c'''"
        },
        "c1": {
            "a":"g'",
            "b":"a'",
            "c":"b'",
            "d":"c''",
            "e":"d''",
            "f":"e''",
            "g":"f''",
            "h":"g''",
            "i":"a''",
            "j":"b''",
            "k":"c'''",
            "l":"d'''",
            "m":"e'''"
        }
    }
    this.clef = clef;
    this.lilypond = function(gabcpitch) {
        return converterTables[clef][gabcpitch];
//        return "sss";
    }
}
