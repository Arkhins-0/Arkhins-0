/* eslint-disable @next/next/no-img-element -- the character art is swapped from the admin */
import { MapPin, Mail } from 'lucide-react';
import type { Site } from '@/lib/site';
import { ContactForm } from './ContactForm';
import { CopyEmail } from './CopyEmail';
import { Pop } from './Pop';
import { EpisodeHead, Sakura, socialIcon } from './primitives';

/** Next-episode preview: a character holding up a sign, the email and socials, and the message form. */
export function Contact({ site }: { site: Site }) {
  const { profile, socialLinks } = site.portfolio;
  const { contact, sections } = site.anime;
  const copy = site.copy.contact;
  const box = contact.signBox;

  return (
    <section id="contact" className="ak-section overflow-hidden bg-[color:var(--ak-sakura-soft)]">
      <Sakura count={6} />
      <div className="ak-shell relative">
        <EpisodeHead copy={sections.contact} />

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Pop className="space-y-6">
            {contact.image && (
              <div className="relative mx-auto max-w-[280px]">
                <img src={contact.image} alt={contact.imageAlt} loading="lazy" className="h-auto w-full drop-shadow-[5px_6px_0_rgba(28,22,51,0.18)]" />
                {contact.signText && box && (
                  <span
                    className="ak-display absolute flex items-center justify-center bg-white text-center text-[clamp(1.2rem,4vw,2rem)] leading-tight text-[color:var(--ak-sakura)]"
                    style={{ top: `${box.top}%`, left: `${box.left}%`, width: `${box.width}%`, height: `${box.height}%` }}
                  >
                    {contact.signText}
                  </span>
                )}
              </div>
            )}

            <div className="ak-cel p-5">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[color:var(--ak-sakura)]">
                <Mail size={16} /> {copy.emailLabel}
              </div>
              <a href={`mailto:${profile.email}`} className="ak-display mt-1 block break-all text-lg leading-snug hover:underline md:text-xl">
                {profile.email}
              </a>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <CopyEmail email={profile.email} label={contact.copy} done={contact.copied} />
                <span className="flex items-center gap-1 text-sm font-bold text-[color:var(--ak-ink-2)]">
                  <MapPin size={14} /> {profile.city}, {profile.country}
                </span>
              </div>
            </div>

            <ul className="flex flex-wrap gap-2">
              {socialLinks.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="ak-tag ak-lift gap-2 px-3 py-2 text-sm shadow-[2px_2px_0_var(--ak-ink)]">
                    <span className="text-base">{socialIcon(s.icon)}</span>
                    {s.username}
                  </a>
                </li>
              ))}
            </ul>
          </Pop>

          <Pop delay={0.08}>
            <ContactForm
              title={contact.formTitle}
              copy={{
                fields: copy.fields,
                messageField: copy.messageField,
                submitLabel: copy.submitLabel,
                sendingLabel: copy.sendingLabel,
                successLabel: copy.successLabel,
                errorLabel: copy.errorLabel,
                endpoint: copy.endpoint,
                formEntries: copy.formEntries,
                iframeName: copy.iframeName,
                iframeTitle: copy.iframeTitle,
              }}
            />
          </Pop>
        </div>
      </div>
    </section>
  );
}
