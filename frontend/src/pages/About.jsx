import {
  ArrowUpRight,
  HeartHandshake,
  Leaf,
  Target,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import AssetImage from "../components/AssetImage";
import {
  aboutText,
  directorMessage,
  principalMessage,
  school,
  galleryFallback,
} from "../data/site";

export default function About() {
  return (
    <>
      <PageHero
        title="A school built around learning and values."
        crumb="About the academy"
        description="Get to know the people, principles and purpose behind P.N. Central Academy."
      />
      <section className="section">
        <div className="container about-page-grid">
          <div>
            <p className="eyebrow">OUR STORY</p>
            <h2 className="section-heading">
              A place to learn, belong and grow.
            </h2>
            <p className="lead-paragraph">{aboutText}</p>
            <p className="body-copy">
              The academy’s published message emphasises a student-centred
              environment, concept clarity, discipline and holistic development.
              Those commitments guide how the site presents the school to
              families considering admission.
            </p>
            <p className="body-copy">
              The school website describes P.N. Central Academy as an
              English-medium, co-educational institution following the CBSE
              curriculum. Parents should contact the school to confirm the
              current classes offered, transport, timings, availability and
              documentation.
            </p>
            <div className="about-quick-points">
              <div>
                <Users size={21} />
                <span>Student-centred learning</span>
              </div>
              <div>
                <HeartHandshake size={21} />
                <span>Strong relationships & care</span>
              </div>
              <div>
                <Leaf size={21} />
                <span>Holistic development</span>
              </div>
              <div>
                <Target size={21} />
                <span>Purposeful learning</span>
              </div>
            </div>
            <Link to="/admissions" className="button button-primary">
              Ask about admissions <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="about-page-visual">
            <AssetImage
              src="/assets/campus-square-image.png"
              fallback={galleryFallback[0].fallback}
              alt="P.N. Central Academy campus"
            />
            <div className="about-page-tag">
              <span>PNCA</span>
              <small>Saidabad · Prayagraj</small>
            </div>
          </div>
        </div>
      </section>
      <section className="section section-light">
        <div className="container">
          <div className="section-header centered-header">
            <p className="eyebrow">LEADERSHIP</p>
            <h2 className="section-heading">
              Guidance with a sense of purpose.
            </h2>
            <p className="section-description">
              Messages published on the school website highlight learning,
              confidence, discipline and individual potential.
            </p>
          </div>
          <div className="leadership-grid">
            <article className="message-card director-card">
              <div className="leader-photo">
                <AssetImage
                  src="/assets/director.png"
                  fallback="#"
                  alt="Mr. Santosh Tiwari, Director"
                />
              </div>
              <div className="message-content">
                <p>{directorMessage}</p>
                <div className="leader-attribution">
                  <strong>{school.director}</strong>
                  <span>Director</span>
                </div>
              </div>
            </article>
            <article className="message-card principal-card">
              <div className="leader-photo leader-placeholder">
                <AssetImage
                  src="/assets/principal.png"
                  fallback="#"
                  alt="Dr. Neeta Mishra, Principal"
                />
              </div>
              <div className="message-content">
                <p>{principalMessage}</p>
                <div className="leader-attribution">
                  <strong>{school.principal}</strong>
                  <span>Principal</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
