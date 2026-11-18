"use client";
import Link from "next/link";
import { useState } from "react";
export function ContactForm() {
  const [opened, setOpened] = useState(false);
  return (
    <form
      className="projectForm"
      onSubmit={(e) => {
        e.preventDefault();
        const fields = new FormData(e.currentTarget);
        const body = [
          fields.get("brief"),
          "",
          fields.get("name"),
          fields.get("email"),
          fields.get("company"),
        ]
          .filter((v) => v !== null)
          .join("\n");
        window.location.href =
          "mailto:hello@milesokoro.com?subject=Website%20project&body=" +
          encodeURIComponent(body);
        setOpened(true);
      }}
    >
      <input
        name="name"
        aria-label="Your name"
        placeholder="Your name"
        autoComplete="name"
        required
      />
      <input
        type="email"
        name="email"
        aria-label="Email"
        placeholder="you@company.com"
        autoComplete="email"
        required
      />
      <input
        name="company"
        aria-label="Company"
        placeholder="Company"
        autoComplete="organization"
      />
      <textarea
        name="brief"
        aria-label="Project brief"
        placeholder="What should the new site do?"
        required
      />
      <button type="submit">Send</button>
      <small>
        {opened
          ? "Finish sending in your email app."
          : "Send opens a draft in your email app."}{" "}
        <Link href="/privacy">Privacy policy.</Link>
      </small>
    </form>
  );
}
