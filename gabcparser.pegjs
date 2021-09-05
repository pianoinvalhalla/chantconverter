// PEG.js grammar for parsing gabc
// ==========================
//
//

Gabc
    = (Newline / HeaderComment)* h:Header HeaderSeparator d:Description {return {"header":h,"words":d}}

HeaderSeparator
    = _* "%%" (_ / Newline)+

Header
    = n:HeaderField+ {
        const dict = new Object();
        n.forEach((element) => {
            dict[element[0]] = element[1];
        })
        return dict;
      }

HeaderComment
    = !(HeaderSeparator FirstClef) "%" [^\t\r\n]* Newline+ {return [null,undefined]}
    
HeaderFieldSeparator
    = (";;" / ";") _* (Newline / HeaderComment)+

HeaderField
    = a:Key KeySeparator b:Value HeaderFieldSeparator {return [a,b]}

KeySeparator
    = ":" _*

Key
    = n:(Escape / [^%:;])+ {return n.join("")}

Value
    = n:(Escape / [^%;])+ {return n.join("")}

//Hchar
//    = Escape / [^%:;]

Description
    = a:FirstClef n:Word+ {
        n.unshift({"syllables":[{"text":null,"notes":[a]}]})
        return n
        }

FirstClef
    = "(" n:Clef ")" (_ / Newline / DescriptionComment)* {return n}

Word
    = n:(Syllable / NakedText)+ (_ / Newline / DescriptionComment)* {return {"syllables":n}}

DescriptionComment
    = "%" [^\t\r\n]* Newline*
    //fixes problem with comment at end of file
    //this works because * is greedy

Syllable
    = a:(TagText / Text)? b:Notes {return {"text":a,"notes":b}}

TagText
    = a:"<" b:(Escape / [^ %()>])+ c:">" n:(Escape / [^%()<])* x:"</" y:(Escape / [^ %()>])+ z:">" {
    return a.concat(b.join(""),c,n.join(""),x,y.join(""),z)}

NakedText
    = a:(Text / TagText) {return {"text":a,"notes":[]}}

Text
    = !TagText b:(Dchar / DumbColon)+ {return b.join("")}

DumbColon
    = _? n:":" {return n}

Notes
    = "(" n:(Clef / Note / Bar)* ")" {return n}

Note
    = a:Pitch b:Mod* {return {"pitch":a,"mods":b}}

Pitch
    = [a-mA-M]

Bar
    = n:("::" / (":" [1-6_'\?]) / ";'" / ",_" / ",0" / [:;,`]) z:Z* {
    z.unshift(n)
    return {"pitch":"bar","mods":[z]}
    }
    //need to fix :1 :2 etc.

Clef
    = a:SingleClef b:("@" SingleClef)? {
    return {"pitch":"clef","mods":[a].concat(b == null ? [] : b)}}

SingleClef
    = a:([cf] "b"? [1-5]) {return a.join("")}

Mod
    = a:("sss" / "ss" / ".." / "vv" / Tweak / Escape / [^%():;,a-mA-M[\]]) b:[0-9]* {
    return a.concat(b.join(""))}

Tweak
    = a:"[" b:(Escape / [^%()[\]])* c:"]" {return a.concat(b.join(""),c)}

Z
    = n:("z0" / [zZ])

Dchar
    = Escape / [^ %()\t\r\n]

_ "whitespace"
    = " "+

Newline
    = [\t\r\n]

Escape
    = "$" n:[^] {return n}
