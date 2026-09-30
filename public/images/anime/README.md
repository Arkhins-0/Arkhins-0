# Anime art

Every picture on the anime-themed pages. Paths here are what /admin and `src/data` point to.

```
sections/                 one illustration per home-page section
  about.png               profile card
  contact.png             contact section (holds a sign)
  footer.png              footer (bowing)
  skills.png              power levels
  story.png               story arcs
characters/<name>/        one folder per character, same file names in each
  figure.webp             main full-figure cut-out (cards, hero, role picker)
  face.webp               square face crop (role-picker tabs, small avatars)
  pose-01.webp ...        extra poses (project pages place these throughout)
  sources.json            where each image came from
```

Not every character has every file: some are poses only, some a figure only.

## Characters and where they appear

| Folder | Series | Used for |
|---|---|---|
| `zero-two` | Darling in the Franxx | hero; role picker, UI/UX |
| `2b` | NieR:Automata | role picker, full-stack |
| `rem` | Re:Zero | role picker, backend |
| `komi` | Komi Can't Communicate | role picker, data |
| `megumin` | KonoSuba | role picker, AI/ML; guest on Microsoft stock |
| `frieren` | Frieren | guest on Hygieia |
| `bocchi` | Bocchi the Rock! | guest on Bookisham |
| `kaguya` | Kaguya-sama | guest on Scholar Track |
| `gojo` | Jujutsu Kaisen | guest on Spartan |
| `anya` | Spy x Family | guest on BidNest |
| `tanjiro` | Demon Slayer | guest on Chennai Turbo Riders |
| `yor` | Spy x Family | guest on CTR Sports |
| `chika` | Kaguya-sama | spare guest for the next new project |
| `denji` | Chainsaw Man | spare guest |
| `alya` | Alya Sometimes Hides Her Feelings in Russian | stored, not used |
| `yui`, `mio`, `ritsu`, `azusa`, `tsumugi` | K-On! | stored, not used |

The section art is Wikipe-tan and other freely licensed illustrations; the footer's "Art credits"
list names each one. Character art is fan use, with sources in each folder's `sources.json`.

## Adding art

Put new files in the character's folder with the names above, then set the path in /admin
(Anime theme for section art, Role picker or Guest stars for characters). Transparent WebP or PNG
cut-outs work best; tall figures are fine, the page caps their height.
