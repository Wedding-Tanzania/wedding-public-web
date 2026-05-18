'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

type Topic = 'couple' | 'vendor' | 'press' | 'careers' | 'other';

const topics: { value: Topic; label: string }[] = [
  { value: 'couple', label: 'I am a couple planning a wedding' },
  { value: 'vendor', label: 'I want to become a vendor' },
  { value: 'press', label: 'Press or partnership enquiry' },
  { value: 'careers', label: 'Careers at Lockwood' },
  { value: 'other', label: 'Something else' },
];

export function ContactForm() {
  const params = useSearchParams();
  const initial = (params.get('topic') as Topic) ?? 'couple';
  const [topic, setTopic] = useState<Topic>(initial);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = params.get('topic') as Topic | null;
    if (t !== null && topics.some((o) => o.value === t)) setTopic(t);
  }, [params]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-herb-50 border border-champagne rounded-lg p-12 text-center">
        <div className="font-sans text-herb-300 text-6xl leading-none">"</div>
        <div className="font-sans text-3xl text-herb-900 mt-2">Thank you.</div>
        <p className="font-sans text-lg text-ink-2 mt-4 max-w-md mx-auto leading-relaxed">
          We will write back within one business day. In the meantime, browse the vendor directory
          or have a look at real wedding stories.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-paper border border-bordr rounded-lg p-8 lg:p-12 space-y-6"
    >
      <div>
        <Label>Topic</Label>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          {topics.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setTopic(opt.value)}
              className={`text-left px-4 py-3 rounded-md border text-sm transition ${
                topic === opt.value
                  ? 'border-herb-600 bg-herb-50 text-herb-800'
                  : 'border-bordr bg-paper text-ink-2 hover:border-herb-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your name" name="name" placeholder="Amani Mwakatumbula" required />
        <Field label="Phone" name="phone" placeholder="+255 754 000 000" required />
      </div>

      <Field label="Email" name="email" type="email" placeholder="you@example.com" required />

      {topic === 'couple' && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Partner's name" name="partner" placeholder="Nyota" />
          <Field label="Wedding date (rough)" name="date" type="date" />
        </div>
      )}

      {topic === 'vendor' && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Business name" name="business" placeholder="Kilima Gardens Estate" required />
          <Field label="Category" name="category" placeholder="Venue, photography, ..." required />
        </div>
      )}

      <div>
        <Label>Message</Label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell us a little about what you need..."
          className="mt-2 w-full rounded-md border border-bordr bg-paper px-4 py-3 text-ink-1 placeholder:text-ink-3 focus:outline-none focus:border-herb-500"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[11px] uppercase tracking-widest text-ink-3">
          We reply within one business day.
        </p>
        <button type="submit" className="btn btn-primary">
          Send message
        </button>
      </div>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-widest text-ink-3 font-medium">{children}</span>
  );
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-md border border-bordr bg-paper px-4 py-3 text-ink-1 placeholder:text-ink-3 focus:outline-none focus:border-herb-500"
      />
    </label>
  );
}
