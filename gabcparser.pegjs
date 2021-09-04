// Lorem ipsum dolor sit amet
// ==========================
//
//

Gabc
    = h:Header HeaderSeparator d:Description {return {"header":h,"words":d}}

HeaderSeparator
    = Newline? "%%" Newline+

Header
    = n:(HeaderField / HeaderComment)+ {
        const dict = new Object();
        n.forEach((element) => {
            dict[element[0]] = element[1];
        })
        return dict;
      }

HeaderComment
    = "%" ([^%\t\r\n] [^\t\r\n]*)? Newline+ {return [null,undefined]}
    
HeaderFieldSeparator
    = (";;" / ";") _* Newline+

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
    = a:FirstClef _? n:Word+ {
        n.unshift({"syllables":[{"text":null,"notes":[a]}]})
        return n
        }

FirstClef
    = "(" n:Clef ")" {return n}

Word
    = n:(Syllable / NakedText)+ (_ / Newline / DescriptionComment)* {return {"syllables":n}}

DescriptionComment
    = "%" [^\t\r\n]* Newline+

Syllable
    = a:(Text / TagText)? b:Notes {return {"text":a,"notes":b}}

TagText
    = "<" (Escape / [^ %()>])+ ">" n:(Dchar / " ")* "</" (Escape / [^ %()>])+ ">" {return n.join("")}

NakedText
    = a:(Text / TagText) {return {"text":a,"notes":[]}}

Text
    = b:(Dchar / DumbColon)+ {return b.join("").replace(/[{}]/g,"")}
    //removes {}

DumbColon
    = _? n:":" {return n}

Notes
    = "(" n:(Clef / Note / Bar)* ")" {return n}

Note
    = a:Pitch b:Mod* {return {"pitch":a,"mods":b}}

Pitch
    = [a-mA-M]

Bar
    = n:("::" / (":" [1-6_']) / [:;,]) {return {"pitch":"bar","mods":[n]}}

Clef
    = n:("c1" / "c2" / "c3" / "c4" / "f2" / "f3" / "f4" / "cb3") {return {"pitch":"clef","mods":[n]}}

Mod
    = "sss" / "ss" / ".." / "vv" / Tweak / Escape / [^%():;,a-mA-M[\]]

Tweak
    = a:"[" b:(Escape / [^%()[\]])* c:"]" {return a.concat(b.join(""),c)}

Dchar
    = Escape / [^ %()<>\t\r\n]

_ "whitespace"
    = " "+

Newline
    = [\t\r\n]+

Escape
    = "$" n:[^] {return n}
