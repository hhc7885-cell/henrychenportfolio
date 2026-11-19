import { PageHead } from "@/components/sites/mutoscope/PageHead";
import { Socials } from "@/components/sites/mutoscope/Chrome";
import resume from "@/components/sites/mutoscope/resume.json";
import styles from "@/components/sites/mutoscope/resume.module.css";

export const metadata = { title: "联系方式" };

export default function Contact() {
  return (
    <main className="container">
      <PageHead page="contact" />
      <address className={styles.contact}>
        <dl>
          <div>
            <dt>手机</dt>
            <dd><a href={"tel:+86" + resume.phone}>{resume.phone}</a></dd>
          </div>
          <div>
            <dt>邮箱</dt>
            <dd><a href={"mailto:" + resume.email}>{resume.email}</a></dd>
          </div>
        </dl>
        <Socials />
      </address>
    </main>
  );
}

