import content from "@/components/sites/mutoscope/content.json";
import { PageHead } from "@/components/sites/mutoscope/PageHead";
export const metadata = { title: "Privacy Policy" };
export default function Privacy() {
  return (
    <main className="container">
      <PageHead page="privacy" />
      <article className="policy">
        {content.privacy.blocks.map(({ heading, body }) => (
          <section key={body}>
            {heading && <h2>{heading}</h2>}
            <p>{body}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
