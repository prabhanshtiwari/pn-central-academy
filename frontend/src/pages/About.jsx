
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
        title="About P.N. Central Academy"
        crumb="About Us"
        description="Discover our school, our educational approach, and the people who lead our learning community."
      />

      <section className="section">
        <div className="container about-page-grid">
          <div>
            <p className="eyebrow">ABOUT OUR SCHOOL</p>

            <h2 className="section-heading">
              A place to learn, belong and grow.
            </h2>

            <p className="lead-paragraph">{aboutText}</p>

            <p className="body-copy">
              P.N. Central Academy is an English-medium,
              co-educational school located in Saidabad,
              Prayagraj, Uttar Pradesh. The school follows
              the CBSE curriculum and aims to provide students
              with a strong foundation in academics, practical
              knowledge, and essential life skills.
            </p>

            <p className="body-copy">
              Our approach to education encourages curiosity,
              independent thinking, discipline, creativity,
              and respect for others. We believe that every
              student should have the opportunity to develop
              their abilities, discover their interests, and
              prepare for the challenges of the future.
            </p>

            <div className="about-quick-points">
              <div>
                <Users size={21} />
                <span>Student-focused education</span>
              </div>

              <div>
                <HeartHandshake size={21} />
                <span>Care and mutual respect</span>
              </div>

              <div>
                <Leaf size={21} />
                <span>All-round development</span>
              </div>

              <div>
                <Target size={21} />
                <span>Academic excellence</span>
              </div>
            </div>

            <Link to="/admissions" className="button button-primary">
              Explore Admissions <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="about-page-visual">
            <AssetImage
              src="/assets/campus-square-image.png"
              fallback={galleryFallback[0].fallback}
              alt="P.N. Central Academy campus, Saidabad, Prayagraj"
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
            <p className="eyebrow">OUR LEADERSHIP</p>

            <h2 className="section-heading">
              Meet Our School Leadership
            </h2>

            <p className="section-description">
              Get to know the Director and Principal of
              P.N. Central Academy.
            </p>
          </div>

          <div className="leadership-grid">
            <article className="message-card director-card">
              <div className="leader-photo">
                <AssetImage
                  src="/assets/director.png"
                  fallback="#"
                  alt={`${school.director}, Director`}
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
                  alt={`${school.principal}, Principal`}
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
