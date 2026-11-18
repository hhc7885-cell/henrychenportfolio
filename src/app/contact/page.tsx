import { PageHead } from "@/components/sites/mutoscope/PageHead";
import { Socials } from "@/components/sites/mutoscope/Chrome";
import { ContactForm } from "@/components/sites/mutoscope/ContactForm";
export const metadata = { title: "Contact" };
export default function Contact() {
  return (
    <main className="container">
      <PageHead page="contact" />
      <div className="twoUp contactBody">
        <div className="direct">
          <a
            className="chatSeal"
            href="https://wa.me/12135550129"
            target="_blank"
            rel="noreferrer"
            aria-label="Message me on WhatsApp"
          >
            <svg viewBox="0 0 200 200">
              <defs>
                <path
                  id="chatRing"
                  d="M28 100a72 72 0 1 1 144 0 72 72 0 1 1-144 0"
                />
              </defs>
              <text>
                <textPath
                  href="#chatRing"
                  textLength="452"
                  lengthAdjust="spacing"
                >
                  MESSAGE ME ON WHATSAPP · MESSAGE ME ON WHATSAPP ·{" "}
                </textPath>
              </text>
              <circle cx="100" cy="100" r="55" />
            </svg>
            <i />
          </a>
          <a className="contactEmail" href="mailto:hello@milesokoro.com">
            hello@milesokoro.com
          </a>
          <div className="location">
            Chicago, Illinois · Central Time
            <br />
            Open for new projects
          </div>
          <Socials />
        </div>
        <ContactForm />
      </div>
    </main>
  );
}
