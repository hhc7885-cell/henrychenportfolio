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
          "mailto:hhc7885@gmail.com?subject=Creative%20collaboration&body=" +
          encodeURIComponent(body);
        setOpened(true);
      }}
    >
      <input
        name="name"
        aria-label="你的姓名"
        placeholder="你的姓名"
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
        placeholder="公司或团队（选填）"
        autoComplete="organization"
      />
      <textarea
        name="brief"
        aria-label="Project brief"
        placeholder="你想一起做些什么？"
        required
      />
      <button type="submit">Send</button>
      <small>
        {opened
          ? "请在邮件应用中确认并发送。"
          : "点击 Send 会在你的邮件应用中生成草稿。"}{" "}
        <Link href="/privacy">Privacy policy.</Link>
      </small>
    </form>
  );
}
