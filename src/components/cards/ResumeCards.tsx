import { AwardIcon, BookOpenIcon, BriefcaseIcon, GraduationCapIcon } from "lucide-react"

import LogoBox from "@/components/LogoBox"
import { formatMonthYear } from "@/lib/date"
import type { Certification, Education, Experience, Language } from "@/lib/types"

const row =
  "flex flex-col gap-2 border-t first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"

/** Under the text on a phone (lined up past the logo), beside it from sm up. */
const when = "shrink-0 pl-14 text-sm text-muted italic sm:pl-0"

export function ExperienceCard({ experience }: { experience: Experience }) {
  const { position, company, location, startDate, endDate, current, type, description, logo, url } = experience
  const range = `${formatMonthYear(startDate)} — ${current || !endDate ? "Present" : formatMonthYear(endDate)}`

  return (
    <article className={`${row} py-6`}>
      <div className="flex gap-x-4">
        <LogoBox src={logo} alt={company} fallback={logo === null && !url ? BookOpenIcon : BriefcaseIcon} />
        <div className="space-y-1.5">
          <div className="space-y-0.5">
            <h3 className="text-lg font-semibold tracking-tight">{position}</h3>
            <p className="text-sm text-muted">
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="font-normal">
                  {company}
                </a>
              ) : (
                company
              )}
              {location && ` · ${location}`}
              {type && ` · ${type.toLowerCase()}`}
            </p>
          </div>
          {description && <p className="max-w-prose text-sm leading-relaxed text-pretty">{description}</p>}
        </div>
      </div>
      <p className={when}>{range}</p>
    </article>
  )
}

export function EducationCard({ education }: { education: Education }) {
  return (
    <article className={`${row} py-6`}>
      <div className="flex gap-x-4">
        <LogoBox src={education.logo} alt={education.institution} fallback={GraduationCapIcon} />
        <div className="space-y-0.5">
          <h3 className="text-lg font-semibold tracking-tight">{education.degree}</h3>
          <p className="text-sm text-muted">
            {education.institution} · {education.location} · {education.score}
          </p>
        </div>
      </div>
      <p className={when}>
        {education.startYear} — {education.endYear}
      </p>
    </article>
  )
}

export function CertificationCard({ certification }: { certification: Certification }) {
  const { name, issuer, date, credentialUrl, badge } = certification

  return (
    <article className={`${row} py-4`}>
      <div className="flex items-center gap-x-4">
        <LogoBox src={badge} alt={issuer} fallback={AwardIcon} />
        <div className="space-y-0.5">
          <h3 className="font-body font-medium">{name}</h3>
          <p className="text-sm text-muted">
            {issuer}
            {credentialUrl && (
              <>
                {" · "}
                <a href={credentialUrl} target="_blank" rel="noopener noreferrer">
                  verify
                </a>
              </>
            )}
          </p>
        </div>
      </div>
      <p className={when}>{formatMonthYear(date)}</p>
    </article>
  )
}

export function LanguageCard({ language }: { language: Language }) {
  return (
    <article className="flex items-center justify-between gap-4 border-t py-3 first:border-t-0 first:pt-0 last:pb-0">
      <h3 className="font-body">{language.name}</h3>
      <p className="shrink-0 text-sm text-muted italic">{language.proficiency}</p>
    </article>
  )
}
