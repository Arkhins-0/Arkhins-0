import { NextResponse } from 'next/server';
import content from '@/data/content.json';

const ENTRY = content.contact.formEntries;

/** Relays a contact submission to the form endpoint configured in the environment. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body || {};

    const formUrl = process.env.GOOGLE_FORM_ACTION;
    if (!formUrl) {
      return NextResponse.json(
        { success: false, error: 'GOOGLE_FORM_ACTION not configured' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams();
    params.append(ENTRY.name, name || '');
    params.append(ENTRY.email, email || '');
    params.append(ENTRY.subject, subject || '');
    params.append(ENTRY.message, message || '');

    const resp = await fetch(formUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      redirect: 'manual' as RequestRedirect,
    });

    if (resp.ok || resp.status === 302) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, status: resp.status },
      { status: 502 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
