export const site = {
  name: "Krishna Vijay G",
  alias: "Arkhins",
  email: "arkhins@arkhins.com",
  tagline: "designer · full-stack developer · ai/ml practitioner · web developer",
  description:
    "Krishna Vijay G (Arkhins) is a full-stack developer and designer in Chennai who ships production web platforms for motorsport, education and finance.",
  url: "https://arkhins.com",
  locale: "en",
  keywords: [
    "krishna vijay",
    "krishna vijay g",
    "arkhins",
    "full-stack developer",
    "ui/ux designer",
    "ai/ml",
    "next.js",
    "chennai",
  ],
} as const

export const resume = {
  filename: "resume.pdf",
  detail: "pdf · katb.in",
  url: "https://katb.in/gkvresume",
} as const

export const contactForm = {
  endpoint: "https://docs.google.com/forms/d/16WZFZkgAWlf35nCqFCNPKoB8GO9FUQqZQQ4ZRA9yyZM/formResponse",
  fields: {
    name: "entry.1444212408",
    email: "entry.12430413",
    subject: "entry.1777991339",
    message: "entry.445717152",
  },
} as const

export interface Link {
  label: string
  href: string
}

export const navLinks: Link[] = [
  { label: "projects", href: "/projects" },
  { label: "blog", href: "/blog" },
  { label: "contact", href: "/#contact" },
]

export const socialLinks: Link[] = [
  { label: "email", href: `mailto:${site.email}` },
  { label: "github", href: "https://github.com/Arkhins-0" },
  { label: "linkedin", href: "https://www.linkedin.com/in/arkhins/" },
  { label: "instagram", href: "https://www.instagram.com/arkhins/" },
  { label: "telegram", href: "https://t.me/arkhins" },
]

const identityLinks = socialLinks.filter((link) => link.href.startsWith("http")).map((link) => link.href)

export const personEntity = {
  "@type": "Person",
  name: site.name,
  alternateName: site.alias,
  email: site.email,
  url: site.url,
  jobTitle: "Full-stack Developer & Designer",
  sameAs: identityLinks,
} as const

export const personSchema = { "@context": "https://schema.org", ...personEntity }

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  description: site.description,
  inLanguage: site.locale,
  keywords: site.keywords,
  url: site.url,
  author: personEntity,
  sameAs: identityLinks,
}
