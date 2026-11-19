import Image from "next/image";
import Link from "next/link";
import { publicAsset } from "@/lib/public-asset";
import projects from "./work/projects.json";

export function ProjectOverview({
  project,
}: {
  project: (typeof projects)[number];
}) {
  const source = project.source.startsWith("/")
    ? publicAsset(project.source)
    : project.source;
  return (
    <main className="container caseStudy">
      <Link href="/work" className="caseBack">
        All work
      </Link>
      <article>
        <div className="caseIntro">
          <div className="caseSummary">
            <p className="caseCategory">
              {project.industry} / {project.year}
            </p>
            <h1>{project.title}</h1>
            <p className="caseSubtitle">{project.essence}</p>
            <p className="caseConcept">{project.about}</p>
            <div className="caseActions">
              <a
                className="casePrimary"
                href={source}
                target="_blank"
                rel="noreferrer"
              >
                {project.sourceLabel}
              </a>
              {project.download && (
                <a href={publicAsset(project.download)} download>
                  下载 PPTX 原文件
                </a>
              )}
            </div>
            <p className="caseFormat">{project.documentInfo}</p>
          </div>
          <Image
            className="caseCover"
            src={publicAsset(project.cover)}
            width={1586}
            height={992}
            alt={project.essence}
            loading="eager"
          />
        </div>
        <section className="caseDetails">
          <h2>我的工作</h2>
          <p>{project.did}</p>
          <dl>
            {[
              ["项目", project.client],
              ["参与方式", project.timeline],
              ["方向", project.services],
            ].map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </article>
    </main>
  );
}
