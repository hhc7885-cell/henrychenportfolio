import { publicAsset } from "@/lib/public-asset";
import Link from "next/link";
import Image from "next/image";
import projects from "@/components/sites/mutoscope/work/projects.json";
import { PageHead } from "@/components/sites/mutoscope/PageHead";
export const metadata = { title: "Work" };
export default function Work() {
  return (
    <main className="container">
      <PageHead page="work" />
      <div className="workGrid">
        {projects.map((p) => (
          <Link href={"/work/" + p.slug} key={p.slug}>
            <div className="workCover">
              <Image
                src={publicAsset(p.cover)}
                width={2496}
                height={1560}
                alt={p.title + " homepage"}
              />
            </div>
            <h2>{p.title}</h2>
            <p>{p.essence}</p>
            <small>
              {p.industry}　{p.year}
            </small>
          </Link>
        ))}
      </div>
    </main>
  );
}
