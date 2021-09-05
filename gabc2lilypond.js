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
//    output += scoreAndLyrics.notes.join(" ");
    output += scoreAndLyrics.notes;
    output += lyricsBraces;
//    output += scoreAndLyrics.lyrics.join(" ")
    output += scoreAndLyrics.lyrics;
    output += endBraces;
    return output;
}

function scoreAndLyricWriter(words) {
    let outputNotes = [];
    let outputLyrics = [];
    let outputWords = [];
    let clef = null;
//    clef = "c3";
    let lPitch = new PitchConverter(clef);
    let iNeedABar = false;
    
    function printNote(gabcpitch) {
        return lPitch.lilypond(gabcpitch);
    }
    function printBar(gabcbar) {
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
                s = '\\bar "" \%funny barline huh\n';
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
    function processTagAndBraces(t) {
        try {
            //strip braces
            t = t.replace(/{}/g,"");
            //strip tags
            //TODO: actually process markup and character tags
            t = t.replace(/<\/?[a-zA-Z]+>/g,"");
        }
        catch (err) {}
        return t;
    }
    
    function Word() {
        this.syllables = [];
        this.bar = '\\bar ""';
        this.getLyric = function() {
            let n = "";
            this.syllables.forEach((syllable) => {
                n += syllable.getLyric();
            })
            return n;
        }
    }
    Word.prototype.toString = function wordToString() { return this.syllables.join(" ").concat(" ",this.bar) }
    
    function Syllable() {
        this.notes = [];
        this.text = "";
        this.hyphen = "";
        this.getLyric = function () {
            let t = this.text == null ? "" : this.text;
            let h = this.hyphen == null ? "" : this.hyphen;
//            let n = "";
//            n = n.concat(this.text,this.hyphen);
            return t.concat(h);
        }
    }
    Syllable.prototype.toString = function syllableToString() { return this.notes.join(" ") }
    
    function Note() {
        this.pitch = "";
        this.value = "";
        this.slur = "";
        this.mods = [];
    }
    Note.prototype.toString = function noteToString() {return this.pitch.concat(this.value,this.slur,this.mods.join(""))}
    
//    words.forEach((word) => {
////        outputNotes.push("foo");
////        outputLyrics.push("bar");
//        word.syllables.forEach((syllable,index,array) => {
//            let t = syllable.text;
//            t = processTagAndBraces(t);
//            if ((t != null) && (index<array.length-1)) { t += " --"; }
////            outputNotes.push("F");
//            if (syllable.notes.length == 0) { t = fixLonelyText(t); }
//            syllable.notes.forEach((note,index,array) => {
////                outputNotes.push(note.pitch);
//                detectUppercase(note);
//                let s = "";
//                switch (note.pitch) {
//                    case "bar":
//                        s = printBar(note.mods[0]);
//                        //remove preceding extra blank bar
//                        const check = outputNotes.pop();
//                        if (check!=='\\bar ""') {
//                            outputNotes.push(check);
//                        }
//                        outputNotes.push(s);
//                        //prevent following extra blank bar
//                        iNeedABar = false;
//                        //text on just a bar
//                        t = fixLonelyText(t);
////                        if (t != null) { t = "\\set stanza = \\markup {"+t+"}"; }
//                        //TODO: bar in the middle of a melisma
//                        break;
//                    case "clef":
//                        setClef(note.mods[0]);
////                        s += note.mods[0];
//                        iNeedABar = false;
//                        break;
//                    default:
//                        s = printNote(note.pitch);
//                        if (array.length > 1) {
//                            switch (index) {
//                                case 0:
//                                    s += "64(";
//                                    break;
//                                case array.length-1:
//                                    s += "4)";
//                                    break;
//                                default:
//                                    s += "64";
//                                    break;
//                            }
//                        } else { s += "4"; }
//                        note.mods.forEach((mod) => {
//                            //process numbers
//                            if (!mod.includes("r")) { mod = mod.replace(/[0-9]/g,""); }
//                            switch (mod) {
//                                case "sss":
//                                    //add a note
//                                case "ss":
//                                case "vv":
//                                    //add a note
//                                    break;
//                                case "..":
//                                    //add a dot to the previous note
//                                    break;
//                                case ".":
//                                    //dot
//                                    break;
//                                case "w":
//                                    //quilisma
//                                    break;
//                                case "~":
//                                    //small
//                                    break;
//                                case "r":
//                                    //white
//                                    break;
//                                case "x":
//                                    //FLAT
//                                    break;
//                                case "y":
//                                    //NATURAL
//                                    break;
//                                case "\#":
//                                    //SHARP
//                                    break;
//                                default:
//                                    break;
//                            }
//                        })
//                        outputNotes.push(s);
//                        iNeedABar = true;
//                }
////                outputNotes.push(s);
//            })
//            outputLyrics.push(t);
//        })
//        if (iNeedABar) { outputNotes.push('\\bar ""'); }
//    })
    
    words.forEach((word) => {
        let newWord = new Word();
        let wordIsReady = false;
        word.syllables.forEach((syllable) => {
            let newSyllable = new Syllable();
            let syllableIsReady = false;
//            let t = syllable.text;
//            t = processTagAndBraces(t);
//            newSyllable.text = t;
            newSyllable.text = syllable.text;
            if (newSyllable.text != null) { syllableIsReady = true; }
//            newSyllable.text = processTagAndBraces(syllable.text);
            syllable.notes.forEach((note) => {
                let newNote = new Note();
                let noteIsReady = false;
                detectUppercase(note);
                switch (note.pitch) {
                    case "bar":
                        //bar directly after some notes OR lonely text + bar
//                        if (syllableIsReady) {
////                            newWord.bar = printBar(note.mods[0]);
////                            newWord.syllables.push(newSyllable)
////                            outputWords.push(newWord);
////                            newWord = new Word();
////                            wordIsReady = false;
////                            newSyllable = new Syllable();
////                            syllableIsReady = false;
//                        } else {
//                            newWord = outputWords
//
//                        }
                        newWord = outputWords.pop();
                        //TODO: MAKE SURE THIS IS CORRECT AFTER PARSER CHANGES
                        newWord.bar = printBar(note.mods[0][0]);
                        outputWords.push(newWord);
                        break;
                    case "clef":
                        setClef(note.mods[0]);
//                        setClef("c4");
//                        lPitch.clef = "c4";
//                        newSyllable.text = "FOOBAR";
//                        syllableIsReady = true;
                        break;
                    default:
                        newNote.pitch = lPitch.lilypond(note.pitch);
                        noteIsReady = true;
//                        note.mods.forEach((mod) => {
//                            //process numbers
//                            if (!mod.includes("r")) { mod = mod.replace(/[0-9]/g,""); }
//                            switch (mod) {
//                                case "sss":
//                                    //add a note
//                                case "ss":
//                                case "vv":
//                                    //add a note
//                                    break;
//                                case "..":
//                                    //add a dot to the previous note
//                                    break;
//                                case ".":
//                                    //dot
//                                    break;
//                                case "w":
//                                    //quilisma
//                                    break;
//                                case "~":
//                                    //small
//                                    break;
//                                case "r":
//                                    //white
//                                    break;
//                                case "x":
//                                    //FLAT
//                                    break;
//                                case "y":
//                                    //NATURAL
//                                    break;
//                                case "\#":
//                                    //SHARP
//                                    break;
//                                default:
//                            }
//                        })
                }
                if (noteIsReady) {
                    newSyllable.notes.push(newNote);
                    syllableIsReady = true;
                }
            })
            if (syllableIsReady) {
                newWord.syllables.push(newSyllable);
                wordIsReady = true;
            }
        })
        if (wordIsReady) { outputWords.push(newWord); }
    })
    
    outputNotes = outputWords.join(" ");
    outputLyrics = "";
    outputWords.forEach((word) => {
        outputLyrics += word.getLyric() + " "
//        outputLyrics.concat(' FOO')
    })
//    outputNotes = "foo"
//    outputLyrics = "bar"
    
    return {"notes":outputNotes,"lyrics":outputLyrics}
}

function PitchConverter(clef) {
//    const gabcpitches = ["a","b","c","d","e","f","g","h","i","j","k","l","m"];
//    const lilypitches = ["f","g","a","b","c'","d'","e'","f'","g'","a'","b'","c''",]
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
        },
        "f4": {
            "a":"d",
            "b":"e",
            "c":"f",
            "d":"g",
            "e":"a",
            "f":"b",
            "g":"c'",
            "h":"d'",
            "i":"e'",
            "j":"f'",
            "k":"g'",
            "l":"a'",
            "m":"b'"
        },
        "f3": {
            "a":"f",
            "b":"g",
            "c":"a",
            "d":"b",
            "e":"c'",
            "f":"d'",
            "g":"e'",
            "h":"f'",
            "i":"g'",
            "j":"a'",
            "k":"b'",
            "l":"c''",
            "m":"d''"
        },
        "f2": {
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
        "f1": {
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
        }//,
//        "cb4": {
//            "a":"a",
//            "b":"bes",
//            "c":"c'",
//            "d":"d'",
//            "e":"e'",
//            "f":"f'",
//            "g":"g'",
//            "h":"a'",
//            "i":"bes'",
//            "j":"c''",
//            "k":"d''",
//            "l":"e''",
//            "m":"f''"
//        },
//        "cb3": {
//            "a":"c'",
//            "b":"d'",
//            "c":"e'",
//            "d":"f'",
//            "e":"g'",
//            "f":"a'",
//            "g":"bes'",
//            "h":"c''",
//            "i":"d''",
//            "j":"e''",
//            "k":"f''",
//            "l":"g''",
//            "m":"a''"
//        },
//        "cb2": {
//            "a":"e'",
//            "b":"f'",
//            "c":"g'",
//            "d":"a'",
//            "e":"bes'",
//            "f":"c''",
//            "g":"d''",
//            "h":"e''",
//            "i":"f''",
//            "j":"g''",
//            "k":"a''",
//            "l":"b''",
//            "m":"c'''"
//        },
//        "cb1": {
//            "a":"g'",
//            "b":"a'",
//            "c":"b'",
//            "d":"c''",
//            "e":"d''",
//            "f":"e''",
//            "g":"f''",
//            "h":"g''",
//            "i":"a''",
//            "j":"b''",
//            "k":"c'''",
//            "l":"d'''",
//            "m":"e'''"
//        },
    }
    this.clef = clef;
    this.lilypond = function(gabcpitch) {
        return converterTables[this.clef][gabcpitch];
        
//        return "sss";
    }
}
