export const COVER_LETTER_TEMPLATE = `/// GetJobAI cover letter template: three styles, single template.

/// Theme definitions
#let themes = (
  minimal: (
    font: ("New Computer Modern", "Libertinus Serif"),
    accent: black,
    muted: luma(100),
    margin-x: 1.8cm,
    body-size: 10pt,
    spacing: 1.2em,
  ),
  technical: (
    font: ("JetBrains Mono", "Libertinus Serif"),
    accent: rgb("#005f87"),
    muted: rgb("#555555"),
    margin-x: 1.2cm,
    body-size: 9pt,
    spacing: 1.1em,
  ),
  professional: (
    font: ("Libertinus Serif",),
    accent: rgb("#1a3a5c"),
    muted: luma(80),
    margin-x: 1.8cm,
    body-size: 10.5pt,
    spacing: 1.3em,
  ),
)

#let cover-letter(data) = {
  let style-name = data.at("style", default: "professional")
  let theme = themes.at(style-name, default: themes.professional)

  set page(
    paper: "a4",
    margin: (
      x: theme.margin-x,
      y: 2cm,
    ),
  )

  set text(
    font: theme.font,
    size: theme.body-size,
    lang: "en",
  )

  set par(
    justify: true,
    leading: 0.65em,
    spacing: theme.spacing,
  )

  // Sender's Name & Header
  align(center)[
    #text(
      size: theme.body-size + 10pt,
      weight: "bold",
      fill: theme.accent,
    )[#data.sender.name]
    \\
    #v(4pt)
    #text(
      size: theme.body-size - 1pt,
      fill: theme.muted,
    )[
      #let contact-parts = ()
      #if data.sender.email != none { contact-parts.push(data.sender.email) }
      #if data.sender.phone != none { contact-parts.push(data.sender.phone) }
      #if data.sender.location != none { contact-parts.push(data.sender.location) }
      #contact-parts.join("  ·  ")
    ]
  ]

  v(8pt)
  line(
    length: 100%,
    stroke: 0.5pt + theme.accent.lighten(50%),
  )
  v(12pt)

  // Recipient details & Date
  grid(
    columns: (1fr, 1fr),
    gutter: 12pt,
    [
      #strong("To:") \
      #if data.recipient.company != none [ #data.recipient.company \ ]
      #if data.recipient.title != none [ #data.recipient.title ]
    ],
    align(right)[
      #data.date
    ]
  )

  v(15pt)
  if data.subject != none [
    #strong("Subject: " + data.subject)
    #v(10pt)
  ]

  data.body
}
`;
