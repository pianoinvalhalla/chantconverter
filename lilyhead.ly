\version "2.18.0"

\header {
  tagline = " "
}

\paper {
  #(set-paper-size "letter")
  top-margin = 1\in
  left-margin = 1\in
  right-margin = 1\in
  bottom-margin = 1\in
  %max-systems-per-page = 3
  %page-count = #1
}

halfBar = {
  \once \override BreathingSign.stencil = #ly:breathing-sign::divisio-maior
  \once \override BreathingSign.Y-offset = #0
  \breathe
  \bar ""
}

quilisma = {
  \once \override NoteHead.stencil = #ly:text-interface::print
  \once \override NoteHead.font-size = #4.25
  \once \override NoteHead.text = \markup \musicglyph "noteheads.svaticana.quilisma"
}

ictus = \markup \halign #-13 \musicglyph "scripts.ictus"

whiteNote = \once \override NoteHead.duration-log = #1

liquescent = \once \override NoteHead.font-size = -4

\layout {
  indent = #0
  ragged-last = ##t
  \context {
    \Score
    \omit Stem
    \omit Beam
    \omit Flag
    \omit TimeSignature
    \override Slur.direction = #DOWN
    \override SpacingSpanner.common-shortest-duration = #(ly:make-moment 1/12)
  }
}
