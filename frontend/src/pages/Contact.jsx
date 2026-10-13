
import { useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
  LoaderCircle,
  MessageCircle,
} from "lucide-react";
import PageHero from "../components/PageHero";
import api, { getErrorMessage } from "../lib/api";
import { school } from "../data/site";
import { useSite } from "../components/SiteContext";
import { getWhatsAppUrl } from "../lib/contactLinks";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  website: "",
  consent: false,
};

export default function Contact() {
  const { settings } = useSite();

  const whatsappUrl = getWhatsAppUrl(
    settings.phoneWhatsapp || settings.phonePrimary,
    "Hello P.N. Central Academy, I would like to enquire about admissions."
  );

  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({
    kind: "idle",
    message: "",
  });

  function change(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function changeConsent(event) {
    setForm((current) => ({
      ...current,
      consent: event.target.checked,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    setStatus({
      kind: "loading",
      message: "",
    });

    try {
      const { data } = await api.post("/contact", form);

      setStatus({
        kind: "success",
        message:
          data.message ||
          "Thank you for contacting P.N. Central Academy. Your message has been submitted successfully.",
      });

      setForm({ ...emptyForm });
    } catch (error) {
      setStatus({
        kind: "error",
        message: getErrorMessage(error),
      });
    }
  }

  return (
    <>
      <PageHero
        title="Contact P.N. Central Academy"
        crumb="Contact Us"
        description="Get in touch with our school office for admission enquiries, school information, and other assistance."
      />

      <section className="section">
        <div className="container contact-page-grid">
          <div className="contact-page-info">
            <p className="eyebrow">GET IN TOUCH</p>

            <h2 className="section-heading">
              We are here to help.
            </h2>

            <p className="lead-paragraph">
              Have a question about admissions or school
              facilities? Contact our office by phone, email,
              or WhatsApp. You can also send us a message
              using the enquiry form.
            </p>

            <div className="contact-info-cards">
              {settings.phonePrimary && (
                <a
                  href={`tel:${settings.phonePrimary}`}
                  className="contact-info-card"
                >
                  <span>
                    <Phone size={21} />
                  </span>

                  <div>
                    <small>Call the school office</small>
                    <strong>{settings.phonePrimary}</strong>

                    {settings.phoneSecondary && (
                      <small>
                        Alternate: {settings.phoneSecondary}
                      </small>
                    )}
                  </div>

                  <ArrowUpRight size={17} />
                </a>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  className="contact-info-card contact-whatsapp-card"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <MessageCircle size={21} />
                  </span>

                  <div>
                    <small>WhatsApp</small>
                    <strong>Chat with the school</strong>
                    <small>Send an enquiry directly</small>
                  </div>

                  <ArrowUpRight size={17} />
                </a>
              )}

              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="contact-info-card"
                >
                  <span>
                    <Mail size={21} />
                  </span>

                  <div>
                    <small>Email the school</small>
                    <strong>{settings.email}</strong>
                  </div>

                  <ArrowUpRight size={17} />
                </a>
              )}

              <div className="contact-info-card">
                <span>
                  <MapPin size={21} />
                </span>

                <div>
                  <small>School address</small>
                  <strong>
                    {settings.address || school.address}
                  </strong>

                  <a
                    href={school.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get directions <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>

              <div className="contact-info-card">
                <span>
                  <Clock3 size={21} />
                </span>

                <div>
                  <small>Planning a visit?</small>
                  <strong>Contact us before visiting</strong>
                  <small>
                    Please confirm office availability with
                    the school before travelling.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-panel">
            {status.kind === "success" ? (
              <div className="form-success">
                <CheckCircle2 size={34} />

                <h3>Thank You for Contacting Us</h3>

                <p>{status.message}</p>

                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    setStatus({
                      kind: "idle",
                      message: "",
                    })
                  }
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form
                className="contact-form"
                onSubmit={submit}
              >
                <p className="eyebrow">SCHOOL ENQUIRY</p>

                <h3>Send Us a Message</h3>

                <label
                  className="honeypot"
                  aria-hidden="true"
                >
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    name="website"
                    value={form.website}
                    onChange={change}
                  />
                </label>

                <label>
                  Full name <span>*</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={change}
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Enter your full name"
                  />
                </label>

                <div className="form-grid">
                  <label>
                    Email address <span>*</span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={change}
                      required
                      maxLength={254}
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                  </label>

                  <label>
                    Phone number
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={change}
                      maxLength={20}
                      autoComplete="tel"
                      placeholder="Enter phone number"
                    />
                  </label>
                </div>

                <label>
                  Subject <span>*</span>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={change}
                    required
                    minLength={2}
                    maxLength={160}
                    placeholder="e.g. Admission enquiry"
                  />
                </label>

                <label>
                  Your message <span>*</span>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={change}
                    rows={5}
                    required
                    minLength={10}
                    maxLength={4000}
                    placeholder="How can we help you?"
                  />
                </label>

                <label className="consent-row">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={form.consent}
                    onChange={changeConsent}
                    required
                  />

                  <span>
                    I agree that P.N. Central Academy may use
                    the contact details I provide to respond
                    to my enquiry.
                  </span>
                </label>

                {status.kind === "error" && (
                  <p className="form-error" role="alert">
                    {status.message}
                  </p>
                )}

                <button
                  className="button button-primary button-wide"
                  type="submit"
                  disabled={status.kind === "loading"}
                >
                  {status.kind === "loading" ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="spin"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      Submit Enquiry
                      <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="contact-map-section">
        <div className="container contact-map-inner">
          <div className="map-pattern">
            <div className="map-pin-large">
              <MapPin size={28} />
            </div>

            <span className="map-label map-label-one">
              Saidabad
            </span>

            <span className="map-label map-label-two">
              Prayagraj
            </span>

            <span className="map-road road-one" />
            <span className="map-road road-two" />
            <span className="map-road road-three" />
          </div>

          <div>
            <p className="eyebrow">FIND OUR CAMPUS</p>

            <h2 className="section-heading">
              Visit P.N. Central Academy
            </h2>

            <p className="body-copy">
              Find our campus in Saidabad, Prayagraj, Uttar
              Pradesh. Use the directions below to plan
              your journey, and contact the school office
              before your visit.
            </p>

            <a
              href={school.mapUrl}
              className="button button-navy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
