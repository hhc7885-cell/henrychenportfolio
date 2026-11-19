import Image from "next/image";
import { publicAsset } from "@/lib/public-asset";
import resume from "@/components/sites/mutoscope/resume.json";
import styles from "@/components/sites/mutoscope/resume.module.css";

export const metadata = { title: "关于我" };

function ResumeEntries({ entries }: { entries: typeof resume.projects }) {
  return entries.map(({ title, role, dates, details }) => (
    <article className={styles.entry} key={title}>
      <div className={styles.entryHeading}>
        <h3>{title}</h3>
        <p className={styles.date}>{dates}</p>
      </div>
      {role && <p className={styles.role}>{role}</p>}
      <ul>{details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
    </article>
  ));
}

export default function About() {
  const { name, phone, email, education } = resume;
  return (
    <main className={"container " + styles.resume}>
      <div className={styles.profile}>
        <div className={styles.identity}>
          <h1>{name}</h1>
          <p lang="en">Henry Chen</p>
          <address>
            <a href={"tel:+86" + phone}>{phone}</a>
            <a href={"mailto:" + email}>{email}</a>
          </address>
        </div>
        <Image
          className={styles.photo}
          src={publicAsset("/sites/henry/portrait.jpg")}
          alt="陈豪辉在日落时的海滨步道"
          width={1344}
          height={1008}
          sizes="(max-width: 809px) calc(100vw - 32px), 48vw"
          loading="eager"
        />
      </div>

      <section className={styles.section} aria-labelledby="education">
        <h2 id="education">教育经历</h2>
        <article className={styles.entry}>
          <div className={styles.entryHeading}>
            <h3>{education.title}</h3>
            <p className={styles.date}>{education.dates}</p>
          </div>
          <p className={styles.role}>{education.program}</p>
          <ul>{education.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
        </article>
      </section>

      <section className={styles.section} aria-labelledby="experience">
        <h2 id="experience">实习经历</h2>
        <div><ResumeEntries entries={resume.internships} /></div>
      </section>

      <section className={styles.section} aria-labelledby="projects">
        <h2 id="projects">项目经历</h2>
        <div><ResumeEntries entries={resume.projects} /></div>
      </section>

      <section className={styles.section} aria-labelledby="skills">
        <h2 id="skills">技能</h2>
        <div className={styles.entry}>
          <ul>{resume.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
        </div>
      </section>
    </main>
  );
}

