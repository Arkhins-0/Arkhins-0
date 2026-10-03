"use client"

import { MailIcon, SendIcon } from "lucide-react"
import { useRef, useState } from "react"

import SectionHeading from "@/components/SectionHeading"
import { contactForm } from "@/data/site"

const input = "border-b bg-transparent py-2 text-base transition-colors outline-none focus:border-foreground"

/**
 * Posts straight to the Google Form into a hidden iframe, so the page never navigates away.
 * The iframe's load after a submit is the only signal Google gives back, so that is the success state.
 */
export default function Contact() {
  const submitted = useRef(false)
  const [sent, setSent] = useState(false)
  const { endpoint, fields } = contactForm

  return (
    <section id="contact" className="space-y-8">
      <SectionHeading icon={MailIcon}>get in touch</SectionHeading>

      {sent ? (
        <div className="space-y-2" role="status">
          <h3 className="text-xl font-semibold tracking-tight">Thank you for reaching out.</h3>
          <p className="text-muted">Your message was received. I read everything and usually reply within a few days.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="max-w-prose leading-relaxed text-pretty">
            Freelance, full-time, or a half-formed idea you want a second opinion on, all welcome. I read every
            message.
          </p>

          <form
            method="POST"
            action={endpoint}
            target="contact-sink"
            onSubmit={() => (submitted.current = true)}
            className="flex flex-col gap-6"
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-sm italic">name</span>
              <input required type="text" name={fields.name} autoComplete="name" className={input} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm italic">email</span>
              <input required type="email" name={fields.email} autoComplete="email" className={input} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm italic">subject</span>
              <input required type="text" name={fields.subject} className={input} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm italic">message</span>
              <textarea required rows={4} name={fields.message} className={`resize-y ${input}`} />
            </label>
            <button type="submit" className="mt-4 self-start px-4">
              send
              <SendIcon size={14} strokeWidth={1.5} aria-hidden />
            </button>
          </form>
        </div>
      )}

      <iframe
        name="contact-sink"
        title="form target"
        hidden
        onLoad={() => {
          if (submitted.current) setSent(true)
        }}
      />
    </section>
  )
}
