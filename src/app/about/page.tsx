import { publicAsset } from "@/lib/public-asset";
import Image from "next/image";
import content from "@/components/sites/mutoscope/content.json";
import { PageHead } from "@/components/sites/mutoscope/PageHead";
export const metadata = { title: "About" };
export default function About() {
  const { intro, facts, services, process, clients } = content.about;
  return (
    <main className="container">
      <PageHead page="about" />
      <section className="twoUp section">
        <figure>
          <Image
            src={publicAsset("/sites/mutoscope/portrait.jpg")}
            width={1776}
            height={2368}
            alt="Miles Okoro standing by a studio window"
          />
          <figcaption>Miles Okoro, Chicago</figcaption>
        </figure>
        <div className="bio">
          {intro.map((s) => (
            <p key={s}>{s}</p>
          ))}
          <dl className="facts">
            {facts.map(([name, value]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      {[
        { title: "What I do", rows: services },
        { title: "How a project runs", rows: process },
      ].map(({ title, rows }) => (
        <section className="section" key={title}>
          <h2>{title}</h2>
          {rows.map((row) => (
            <div
              className={"serviceRow " + (row.length === 3 ? "step" : "")}
              key={row[0]}
            >
              <strong>
                {row.length === 3 && <small>{row[0]}</small>}
                {row.at(-2)}
              </strong>
              <p>{row.at(-1)}</p>
            </div>
          ))}
        </section>
      ))}
      <section className="section clients">
        <h2>Selected clients</h2>
        <p>{clients}</p>
      </section>
    </main>
  );
}
