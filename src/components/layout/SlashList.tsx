import { SlashIcon } from "lucide-react"
import { Fragment } from "react"

import type { Link } from "@/data/site"

interface Props {
  links: Link[]
  className?: string
  external?: boolean
}

/** A row of links split by small slashes, the separator v3 uses everywhere. */
export default function SlashList({ links, className = "flex items-center gap-x-3", external = true }: Props) {
  return (
    <ul className={className}>
      {links.map((link, i) => (
        <Fragment key={link.href}>
          {i > 0 && <SlashIcon size={8} aria-hidden />}
          <li>
            <a href={link.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {link.label}
            </a>
          </li>
        </Fragment>
      ))}
    </ul>
  )
}
