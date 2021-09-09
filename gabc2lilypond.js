var lilyhead = "";
fetch ("https://pianoinvalhalla.github.io/chantconverter/lilyhead.ly")
//fetch ("lilyhead.ly")
    .then(response => response.text())
    .then(data => {
        lilyhead = data;
    })
//const reader = new FileReader();
//const chosenfile = "lilyhead.ly";
//reader.readAsText(lilyh);
//reader.onload = function (event) {
//    lilyhead = event.target.result;
//}

function convert() {
    //dummyConvert();
    //return;
    const input = document.getElementById("gabc").value;
    const title = document.getElementById("title").value;
    const subtitle = document.getElementById("subtitle").value;
    const poet = document.getElementById("poet").value;
    const composer = document.getElementById("composer").value;
    const copyright = document.getElementById("copyright").value;
    let output = "Lorem ipsum";
    try {
        let parsedInput = gabcparser.parse(input);
        let key = document.getElementById("key").value
        if (document.getElementById("down").checked) {
            key += document.getElementById("down").value
//            key += ","
        }
        output = lilypondWriter(parsedInput,key,title,subtitle,"",poet,composer,copyright);
        document.getElementById("hacklilylink").href = "https://www.hacklily.org/#src="+encodeURIComponent(output);
//        updateHackLilyLink();
        document.getElementById("hacklilybutton").removeAttribute("disabled");
        document.getElementById("downloadbutton").removeAttribute("disabled");
    }
    catch (error) {
        output = "Error";
        document.getElementById("hacklilylink").removeAttribute("href");
        document.getElementById("hacklilybutton").setAttribute("disabled",true);
        document.getElementById("downloadbutton").setAttribute("disabled",true);
        
//        output = error.message;
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

function lilypondWriter(parsedInput,key="c",title="",subtitle="",subsubtitle="",poet="",composer="",copyright="",tagline="") {
    const scoreAndLyrics = scoreAndLyricWriter(parsedInput.words);
    //TODO: add transposition
//    let key = "c'"
    const scoreBraces = "\\score {\n  \\transpose c "+key+" {\n    \\cadenzaOn\n    "
    const lyricsBraces = "\n  }\n  \\addlyrics {\n    "
    const endBraces = "\n  }\n}"
    
//    let output = "";
    
    
    //try getting info from parsed gabc header
    if (!title) {
        try { title = parsedInput.header.name; }
        catch (err) {}
    }
    if (!composer) {
        try { composer = parsedInput.header.commentary; }
        catch (err) {}
    }
    if (!subtitle) {
        try { subtitle = parsedInput.header["office-part"]; }
        catch (err) {}
    }
    
    let output = lilyhead + "\n\n";
    
    output += "\\header {\n";
    
    //write lilypond header properties
    [["title",title],
     ["subtitle",subtitle],
     ["subsubtitle",subsubtitle],
     ["poet",poet],
     ["composer",composer],
     ["copyright",copyright],
     ["tagline",tagline]
     ].forEach((element) => {
        if (element[1]) { output += '  '+element[0]+' = "'+element[1].replace('"','\\"')+'"\n'; }
    })
    
    output += "}\n\n";
    
    
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
    let thisIsNotTheFirstClef = false;
    
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
            case "`":
                s = '\\breathe \\bar ""';
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
//    function fixLonelyText(t) {
//        switch (t) {
//            case null:
//                break;
//            case "*":
//            case "**":
//                t = "\\set stanza = \\markup {"+t+"}";
//                break;
//            default:
//                outputNotes.push("\\once \\hideNotes b'4")
//                t = "\\markup {"+t+"}";
//        }
//        return t;
//    }
//    function processTagAndBraces(t) {
//        try {
//            //strip braces
//            t = t.replace(/[{}]/g,"");
//            //strip tags
//            //TODO: actually process markup and character tags
//            t = t.replace(/<\/?[a-zA-Z]+>/g,"");
//        }
//        catch (err) {}
//        return t;
//    }
    
    const tagTracker = {
        i:false,
        b:false,
        ul:false,
        sc:false,
        c:false,
        sp:false,
        v:false
    }
    
    function processText(text) {
        newText = "";
        text.forEach((element) => {
//            let value = true;
            let tagmatch = element.match(/<(\/?)([^ %()]+)>/)
            if (tagmatch) {
                
//                console.log(element)
//                console.log(tagmatch)
//                console.log(tagmatch[1])
//                console.log(tagmatch[1] === "/")
//                let value = !(tagmatch[1] === "/")
//                console.log(value)
//                tagTracker[tagmatch[2]] = (tagmatch[1] === "/")
//                console.log(tagTracker["sp"])
//                console.log(tagTracker[tagmatch[2]])
//                tagTracker[tagmatch[2]] = value;
                tagTracker[tagmatch[2]] = !(tagmatch[1] === "/")
//                console.log(tagTracker["sp"])
//                console.log(tagTracker[tagmatch[2]])
//                tagTracker[tagmatch[2]] = true;
//                console.log(tagTracker.sp)
            }
            else switch (element) {
                case "{":
                case "}":
                    break;
                case "V/":
                    if (tagTracker.sp) { element = '℣' }
                    printText(element)
                    break;
                case "R/":
                    if (tagTracker.sp) { element = '℟' }
                    printText(element)
                    break;
                case "A/":
                    if (tagTracker.sp) { element = 'Ⱥ' }
                    printText(element)
                    break;
                case "'ae":
                case "'æ":
                    if (tagTracker.sp) { element = 'ǽ' }
                    printText(element)
                    break;
                case "'AE":
                case "'Æ":
                    if (tagTracker.sp) { element = 'Ǽ' }
                    printText(element)
                    break;
                case "'oe":
                case "'œ":
                    if (tagTracker.sp) { element = 'œ' } //no accent character exists in unicode
                    printText(element)
                    break;
                case "'OE":
                case "'Œ":
                    if (tagTracker.sp) { element = 'Œ' }
                    printText(element)
                    break;
                case "\\grecross":
                case "\\grealtcross":
                    if (tagTracker.v) { element = '✠' }
                    printText(element)
                    break;
                case "+":
                    printText("†")
                    break;
//                case "A/":
//                    if (tagTracker.sp) {
//                        newText += ℣
//                        console.log(newText)
//                    }
//                    break;
//                case "'ae":
//                    if (tagTracker.sp) {
//                        newText += ℣
//                        console.log(newText)
//                    }
//                    break;
                default:
                    printText(element)
            }
            function printText(e) {
                if (e) {
                    if (tagTracker.i) { e = " \\italic "+e }
                    if (tagTracker.b) { e = " \\bold "+e }
                    if (tagTracker.ul) { e = " \\underline "+e }
                    if (tagTracker.sc) { e = " \\caps "+e }
                    if (tagTracker.c) { e = " \\with-color #red "+e }
                    newText += e;
                }
//                console.log(newText)
            }
//            if (tagmatch && tagmatch[1]) { value = false; }
//            if (tagmatch && tagmatch[2]) {
//                tagTracker[tagmatch[2]] = value;
//                console.log(tagTracker)
//            }
            
        })
        if (newText.includes("\\")) {
            newText = " \\markup \\concat {"+newText+"}"
        }
        return newText
//        return processTagAndBraces(text.join(""));
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
        this.pushSyllable = function(newSyllable) {
            if (newSyllable.notes.length > 1) {
                const last = newSyllable.notes.length - 1;
                newSyllable.notes[0].slur = "(";
                newSyllable.notes[last].slur = ")";
                newSyllable.notes[last].value = newSyllable.notes[last].value.replace("6","");
                if (!newSyllable.text) { newSyllable.text = "_" }
            }
            else if (newSyllable.notes.length == 1) {
                newSyllable.notes[0].value = newSyllable.notes[0].value.replace("6","")
                if (!newSyllable.text) { newSyllable.text = "_" }
            }
            else {
                //TODO: what happens when a lonely text is in a multisyllabic word?
                newSyllable.fixLonelyText();
                this.bar = "";
            }
            this.syllables.push(newSyllable);
        }
    }
    Word.prototype.toString = function wordToString() { return this.syllables.join(" ").concat(" ",this.bar) }
    
    function Syllable() {
        this.notes = [];
        this.text = "";
        this.hyphen = " -- ";
        this.getLyric = function () {
            let t = !(this.text) ? "" : this.text;
            
            let h = !(this.hyphen) ? "" : (this.text === "_" ? " " : this.hyphen);
//            let n = "";
//            n = n.concat(this.text,this.hyphen);
            return t.concat(h);
        }
        this.fixLonelyText = function () {
            this.hyphen = ""
            switch (this.text) {
                case null:
                    break;
//                case "*":
//                case "**":
//                    if (this.text.includes("\\markup")) { this.text = "\\set stanza = "+this.text }
//                    else { this.text = "\\set stanza = \\markup {"+this.text+"}"; }
//                    break;
                default:
                    this.notes.push("\\once \\hideNotes c''8")
                    if (!this.text.includes('\\markup')) { this.text = " \\markup {"+this.text+"}"; }
            }
        }
    }
    Syllable.prototype.toString = function syllableToString() { return this.notes.join(" ") }
    
    function Note() {
        this.pitch = "";
        this.value = "64";
        this.slur = "";
        this.articulations = [];
        this.tweaks = [];
    }
    Note.prototype.toString = function noteToString() {return this.tweaks.join("").concat(this.pitch,this.value,this.slur,this.articulations.join(""))}
    
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
//            let t = processText(syllable.text);
//            t = processTagAndBraces(t);
//            newSyllable.text = t;
            newSyllable.text = processText(syllable.text)
//            newSyllable.text = processTagAndBraces(syllable.text);
            if (newSyllable.text) { syllableIsReady = true; }
//            newSyllable.text = processTagAndBraces(syllable.text);
            syllable.notes.forEach((note) => {
                let newNote = new Note();
                let noteIsReady = false;
                detectUppercase(note);
                switch (note.pitch) {
                    case "bar":
                        //DONE: barline with other stuff in the parentheses
//                        if (!!(newSyllable.notes) || !!(newWord.syllables)) {
                        if ((newSyllable.notes.length > 0) || (newWord.syllables.length > 0)) {
                            if (syllableIsReady) {
//                                newSyllable.hyphen = ""
                                newWord.pushSyllable(newSyllable);
                                newSyllable = new Syllable();
                                newSyllable.text = "_";
                                syllableIsReady = false;
                            }
                            newWord.bar = printBar(note.mods[0]);
                            
                            const last = newWord.syllables.length - 1;
                            if (last >= 0) {
                                newWord.syllables[last].hyphen = "";
                                //TODO: fix dropped hyphen for syllable in the middle of a word but with barlines in it

//                                console.log("The problem is here")
                            }
                            outputWords.push(newWord);
                            
                            newWord = new Word();
                            wordIsReady = false;
                        }
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
                        else {
                            let prevWord = outputWords.pop();
//                            if (newSyllable.text.match(/\*+|ij|iij/g)) {
                            if (newSyllable.text.match(/ij/g)) {
                                console.log(newSyllable.text)
//                                newSyllable.hyphen = ""
                                prevWord.pushSyllable(newSyllable)
                                prevWord.syllables[prevWord.syllables.length-1].notes[0] = "\\once \\hideNotes b'64"
                                newSyllable = new Syllable()
                                newSyllable.text = "_";
                                syllableIsReady = false;
                            }
//                            console.log(prevWord)
                            //DONE: MAKE SURE THIS IS CORRECT AFTER PARSER CHANGES
                            //TODO: figure out consecutive barlines
                            if (prevWord.bar.includes('\\bar ""') || prevWord.bar === '') {
//                                console.log("replacing "+prevWord.bar+" with "+printBar(note.mods[0]));
                                prevWord.bar = printBar(note.mods[0]); }
                            outputWords.push(prevWord);
                        }
                        lPitch.resetAccidentals(lPitch.clef)
                        break;
                    case "clef":
                        setClef(note.mods[0]);
//                        console.log(lPitch.clef)
                        lPitch.resetAccidentals(lPitch.clef)
//                        setClef("c4");
//                        lPitch.clef = "c4";
//                        newSyllable.text = "FOOBAR";
//                        syllableIsReady = true;
                        //TODO: handle new clef in the middle of the score
                        break;
                    default:
                        newNote.pitch = lPitch.lilypond(note.pitch);
                        noteIsReady = true;
                        note.mods.forEach((mod) => {
                            //process numbers
                            if (!mod.includes("r")) { mod = mod.replace(/[0-9]/g,""); }
                            switch (mod) {
                                case "sss": {
                                    //add a note
                                    let extraNote = new Note();
                                    extraNote.pitch = newNote.pitch;
                                    newSyllable.notes.push(extraNote);
                                    }
                                    //nobreak
                                case "ss":
                                case "vv":
                                    //add a note
                                    let extraNote = new Note();
                                    extraNote.pitch = newNote.pitch;
                                    newSyllable.notes.push(extraNote);
                                    break;
                                case "..":
                                    //dot for previous note
                                    try {
                                        newSyllable.notes[newSyllable.notes.length-1].value += ".";
                                    } catch (err) {
                                        console.log(err)
                                    }
                                    //nobreak
                                case ".":
                                    //dot
                                    newNote.value += ".";
                                    break;
                                case "w":
                                    //quilisma
                                    newNote.tweaks.push('\\quilisma ')
                                    break;
                                case "~":
                                    //small
                                    newNote.tweaks.push('\\liquescent ')
                                    break;
                                case "r":
                                    //white
                                    newNote.tweaks.push('\\whiteNote ')
                                    break;
                                case "'":
                                    //ictus
                                    newNote.articulations.push('^\\ictus')
                                    break;
                                case "___":
                                    try {
                                        newSyllable.notes[newSyllable.notes.length-2].articulations.push('^-')
                                    } catch (err) {
                                        console.log(err)
                                    }
                                    //nobreak
                                case "__":
                                    try {
                                        newSyllable.notes[newSyllable.notes.length-1].articulations.push('^-')
                                    } catch (err) {
                                        console.log(err)
                                    }
                                    //nobreak
                                case "_":
                                    newNote.articulations.push('^-')
                                    break;
                                case "x":
                                    lPitch.setAccidental(note.pitch,-1);
                                    noteIsReady = false;
                                    break;
                                case "y":
                                    lPitch.setAccidental(note.pitch,0);
                                    noteIsReady = false;
                                    break;
                                case "\#":
                                    lPitch.setAccidental(note.pitch,1);
                                    noteIsReady = false;
                                    break;
                                default:
                            }
                        })
                }
                if (noteIsReady) {
                    newSyllable.notes.push(newNote);
                    syllableIsReady = true;
                }
            })
            if (syllableIsReady) {
                newWord.pushSyllable(newSyllable);
                wordIsReady = true;
            }
        })
        if (wordIsReady) {
            const last = newWord.syllables.length - 1;
            if (last >= 0) { newWord.syllables[last].hyphen = ""; }
            outputWords.push(newWord);
            lPitch.resetAccidentals(lPitch.clef)
        }
    })
    
    outputNotes = outputWords.join(" ");
    outputLyrics = "";
    outputWords.forEach((word) => {
        outputLyrics += word.getLyric() + " "
//        outputLyrics.concat(' FOO')
    })
//    outputNotes = "foo"
//    outputLyrics = "bar"
    if (lPitch.clef.includes("b")) {
        outputNotes = "\\key f \\major\n   "+outputNotes;
    } else {
        outputNotes = "\\key c \\major\n   "+outputNotes;
    }
    
    return {"notes":outputNotes,"lyrics":outputLyrics}
}

function PitchConverter(clef) {
//    const gabcpitches = ["a","b","c","d","e","f","g","h","i","j","k","l","m"];
//    const lilypitches = ["f","g","a","b","c'","d'","e'","f'","g'","a'","b'","c''",]
    const gabctonumber = {
        "a":0,
        "b":1,
        "c":2,
        "d":3,
        "e":4,
        "f":5,
        "g":6,
        "h":7,
        "i":8,
        "j":9,
        "k":10,
        "l":11,
        "m":12
    }
//    const lilypitches = {
//        "natural": ["b,","c", "d","e","f","g","a","b","c'","d'","e'","f'","g'","a'","b'","c''","d''","e''","f''","g''","a''","b''","c'''","d'''","e'''"],
//        "flat": ["bes,","ces","des","ees","fes","ges","aes","bes","ces'","des'","ees'","fes'","ges'","aes'","bes'","ces''","des''","ees''","fes''","ges''","aes''","bes''","ces'''","des'''","ees'''"],
//        "sharp":["bis,","cis","dis","eis","fis","gis","ais","bis","cis'","dis'","eis'","fis'","gis'","ais'","bis'","cis''","dis''","eis''","fis''","gis''","ais''","bis''","cis'''","dis'''","eis'''"],
//    }
    const lilypitches = {
        "0": ["b,","c", "d","e","f","g","a","b","c'","d'","e'","f'","g'","a'","b'","c''","d''","e''","f''","g''","a''","b''","c'''","d'''","e'''"],
        "-1": ["bes,","ces","des","ees","fes","ges","aes","bes","ces'","des'","ees'","fes'","ges'","aes'","bes'","ces''","des''","ees''","fes''","ges''","aes''","bes''","ces'''","des'''","ees'''"],
        "1":["bis,","cis","dis","eis","fis","gis","ais","bis","cis'","dis'","eis'","fis'","gis'","ais'","bis'","cis''","dis''","eis''","fis''","gis''","ais''","bis''","cis'''","dis'''","eis'''"],
    }
    const offsetTable = {
        "c5":4,
        "c4":6,
        "c3":8,
        "c2":10,
        "c1":12,
        "f5":0,
        "f4":2,
        "f3":4,
        "f2":6,
        "f1":8,
        "cb5":4,
        "cb4":6,
        "cb3":8,
        "cb2":10,
        "cb1":12
    }
//    const converterTables = {
//        "c4": {
//            "a":"a",
//            "b":"b",
//            "c":"c'",
//            "d":"d'",
//            "e":"e'",
//            "f":"f'",
//            "g":"g'",
//            "h":"a'",
//            "i":"b'",
//            "j":"c''",
//            "k":"d''",
//            "l":"e''",
//            "m":"f''"
//        },
//        "c3": {
//            "a":"c'",
//            "b":"d'",
//            "c":"e'",
//            "d":"f'",
//            "e":"g'",
//            "f":"a'",
//            "g":"b'",
//            "h":"c''",
//            "i":"d''",
//            "j":"e''",
//            "k":"f''",
//            "l":"g''",
//            "m":"a''"
//        },
//        "c2": {
//            "a":"e'",
//            "b":"f'",
//            "c":"g'",
//            "d":"a'",
//            "e":"b'",
//            "f":"c''",
//            "g":"d''",
//            "h":"e''",
//            "i":"f''",
//            "j":"g''",
//            "k":"a''",
//            "l":"b''",
//            "m":"c'''"
//        },
//        "c1": {
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
//        "f4": {
//            "a":"d",
//            "b":"e",
//            "c":"f",
//            "d":"g",
//            "e":"a",
//            "f":"b",
//            "g":"c'",
//            "h":"d'",
//            "i":"e'",
//            "j":"f'",
//            "k":"g'",
//            "l":"a'",
//            "m":"b'"
//        },
//        "f3": {
//            "a":"f",
//            "b":"g",
//            "c":"a",
//            "d":"b",
//            "e":"c'",
//            "f":"d'",
//            "g":"e'",
//            "h":"f'",
//            "i":"g'",
//            "j":"a'",
//            "k":"b'",
//            "l":"c''",
//            "m":"d''"
//        },
//        "f2": {
//            "a":"a",
//            "b":"b",
//            "c":"c'",
//            "d":"d'",
//            "e":"e'",
//            "f":"f'",
//            "g":"g'",
//            "h":"a'",
//            "i":"b'",
//            "j":"c''",
//            "k":"d''",
//            "l":"e''",
//            "m":"f''"
//        },
//        "f1": {
//            "a":"c'",
//            "b":"d'",
//            "c":"e'",
//            "d":"f'",
//            "e":"g'",
//            "f":"a'",
//            "g":"b'",
//            "h":"c''",
//            "i":"d''",
//            "j":"e''",
//            "k":"f''",
//            "l":"g''",
//            "m":"a''"
//        }//,
////        "cb4": {
////            "a":"a",
////            "b":"bes",
////            "c":"c'",
////            "d":"d'",
////            "e":"e'",
////            "f":"f'",
////            "g":"g'",
////            "h":"a'",
////            "i":"bes'",
////            "j":"c''",
////            "k":"d''",
////            "l":"e''",
////            "m":"f''"
////        },
////        "cb3": {
////            "a":"c'",
////            "b":"d'",
////            "c":"e'",
////            "d":"f'",
////            "e":"g'",
////            "f":"a'",
////            "g":"bes'",
////            "h":"c''",
////            "i":"d''",
////            "j":"e''",
////            "k":"f''",
////            "l":"g''",
////            "m":"a''"
////        },
////        "cb2": {
////            "a":"e'",
////            "b":"f'",
////            "c":"g'",
////            "d":"a'",
////            "e":"bes'",
////            "f":"c''",
////            "g":"d''",
////            "h":"e''",
////            "i":"f''",
////            "j":"g''",
////            "k":"a''",
////            "l":"b''",
////            "m":"c'''"
////        },
////        "cb1": {
////            "a":"g'",
////            "b":"a'",
////            "c":"b'",
////            "d":"c''",
////            "e":"d''",
////            "f":"e''",
////            "g":"f''",
////            "h":"g''",
////            "i":"a''",
////            "j":"b''",
////            "k":"c'''",
////            "l":"d'''",
////            "m":"e'''"
////        },
//    }
    this.clef = clef;
//    console.log(clef + " " + this.clef)
    this.resetAccidentals = function() {
        this.accidentals = [0,0,0,0,0,0,0,0,0,0,0,0,0]
        switch (this.clef) {
            case "cb1":
                this.accidentals[2] = -1;
                this.accidentals[9] = -1;
//                console.log("cb1 2 9");
                break;
            case "cb2":
                this.accidentals[4] = -1;
                this.accidentals[11] = -1;
//                console.log("cb2 4 11");
                break;
            case "cb3":
                this.accidentals[6] = -1;
//                console.log("cb3 6");
                break;
            case "cb4":
                this.accidentals[8] = -1;
                this.accidentals[1] = -1;
//                console.log("cb4 8 1");
                break;
            default:
        }
        this.accidentalIsVisible = [false,false,false,false,false,false,false,false,false,false,false,false,false]
    }
    this.setAccidental = function(gabcpitch,accidental=-1) {
        let i = gabctonumber[gabcpitch]
        this.accidentals[i] = accidental
        this.accidentalIsVisible[i] = true
    }
    this.resetAccidentals();
    this.lilypond = function(gabcpitch) {
//        return converterTables[this.clef][gabcpitch];
        let i = gabctonumber[gabcpitch]
        let output = lilypitches[this.accidentals[i]][i+offsetTable[this.clef]] + (this.accidentalIsVisible[i] ? "!" : "")
        this.accidentalIsVisible[i] = false
        return output
        
//        return "sss";
    }
}
