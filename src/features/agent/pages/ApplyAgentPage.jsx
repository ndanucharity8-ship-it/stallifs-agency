import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  ShieldCheck,
  Upload,
  UserPlus,
} from "lucide-react";

import { submitAgentApplication } from "../api/agentApplicationApi";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  nationalId: "",
  kraPin: "",
  county: "",
  experience: "",
  previousCompany: "",
  businessName: "",
  education: "",
  occupation: "",
  preferredRegion: "",
  motivation: "",
};

function ApplyAgentPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);

  const [files, setFiles] = useState({
    cv: null,
    nationalIdDocument: null,
    kraCertificate: null,
    iraCertificate: null,
    goodConduct: null,
    otherDocument: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const { name, files: selectedFiles } = event.target;

    setFiles((current) => ({
      ...current,
      [name]: selectedFiles?.[0] || null,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      await submitAgentApplication(formData);

      setSuccess(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (requestError) {
      console.error(
        "Agent application submission error:",
        requestError
      );

      setError(
        requestError?.response?.data?.message ||
          "Unable to submit your agent application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="success-card">
            <CheckCircle size={56} />

            <span className="eyebrow">
              APPLICATION RECEIVED
            </span>

            <h1>
              Thank you for applying to become a STALLIFS agent.
            </h1>

            <p>
              Your application has been submitted successfully.
              Our recruitment team will review your information
              and contact you using the details you provided.
            </p>

            <div className="success-card__actions">
              <Link
                className="button button--primary"
                to="/"
              >
                Return Home
              </Link>

              <button
                type="button"
                className="button button--secondary"
                onClick={() => navigate("/products")}
              >
                Explore Insurance
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section agent-application-page">
      <div className="container">
        <Link
          to="/"
          className="back-link"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>

        <div className="application-header">
          <div>
            <span className="eyebrow">
              JOIN STALLIFS
            </span>

            <h1>Apply to Become an Agent</h1>

            <p>
              Start your application to join the STALLIFS
              Insurance agent network.
            </p>
          </div>

          <div className="application-header__icon">
            <UserPlus size={36} />
          </div>
        </div>

        <div className="application-info-grid">
          <div className="info-card">
            <ShieldCheck size={25} />

            <div>
              <h3>Professional opportunity</h3>
              <p>
                Build your insurance career with STALLIFS.
              </p>
            </div>
          </div>

          <div className="info-card">
            <FileText size={25} />

            <div>
              <h3>Application review</h3>
              <p>
                Your application will be reviewed by our
                recruitment team.
              </p>
            </div>
          </div>

          <div className="info-card">
            <CheckCircle size={25} />

            <div>
              <h3>Structured process</h3>
              <p>
                Shortlisting and interviews follow the
                application review.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form
          className="agent-application-form"
          onSubmit={handleSubmit}
        >
          {/* ==================================================
              PERSONAL INFORMATION
          =================================================== */}

          <div className="form-section">
            <div className="form-section__heading">
              <span>01</span>

              <div>
                <h2>Personal Information</h2>
                <p>
                  Tell us about yourself.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group form-group--full">
                <label htmlFor="fullName">
                  Full Name *
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address *
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone Number *
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="07XXXXXXXX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nationalId">
                  National ID *
                </label>

                <input
                  id="nationalId"
                  name="nationalId"
                  type="text"
                  value={form.nationalId}
                  onChange={handleChange}
                  required
                  placeholder="National ID number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="kraPin">
                  KRA PIN *
                </label>

                <input
                  id="kraPin"
                  name="kraPin"
                  type="text"
                  value={form.kraPin}
                  onChange={handleChange}
                  required
                  placeholder="KRA PIN"
                />
              </div>

              <div className="form-group">
                <label htmlFor="county">
                  County *
                </label>

                <input
                  id="county"
                  name="county"
                  type="text"
                  value={form.county}
                  onChange={handleChange}
                  required
                  placeholder="County"
                />
              </div>
            </div>
          </div>

          {/* ==================================================
              PROFESSIONAL INFORMATION
          =================================================== */}

          <div className="form-section">
            <div className="form-section__heading">
              <span>02</span>

              <div>
                <h2>Professional Information</h2>
                <p>
                  Help us understand your professional background.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="experience">
                  Insurance Experience *
                </label>

                <select
                  id="experience"
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select experience
                  </option>

                  <option value="None">
                    No previous insurance experience
                  </option>

                  <option value="Less than 1 year">
                    Less than 1 year
                  </option>

                  <option value="1-2 years">
                    1–2 years
                  </option>

                  <option value="3-5 years">
                    3–5 years
                  </option>

                  <option value="More than 5 years">
                    More than 5 years
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="previousCompany">
                  Previous Company
                </label>

                <input
                  id="previousCompany"
                  name="previousCompany"
                  type="text"
                  value={form.previousCompany}
                  onChange={handleChange}
                  placeholder="Previous employer"
                />
              </div>

              <div className="form-group">
                <label htmlFor="businessName">
                  Business Name
                </label>

                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="Business name, if applicable"
                />
              </div>

              <div className="form-group">
                <label htmlFor="education">
                  Education
                </label>

                <input
                  id="education"
                  name="education"
                  type="text"
                  value={form.education}
                  onChange={handleChange}
                  placeholder="Highest qualification"
                />
              </div>

              <div className="form-group">
                <label htmlFor="occupation">
                  Current Occupation
                </label>

                <input
                  id="occupation"
                  name="occupation"
                  type="text"
                  value={form.occupation}
                  onChange={handleChange}
                  placeholder="Current occupation"
                />
              </div>

              <div className="form-group">
                <label htmlFor="preferredRegion">
                  Preferred Region
                </label>

                <input
                  id="preferredRegion"
                  name="preferredRegion"
                  type="text"
                  value={form.preferredRegion}
                  onChange={handleChange}
                  placeholder="Where would you like to operate?"
                />
              </div>

              <div className="form-group form-group--full">
                <label htmlFor="motivation">
                  Why do you want to become a STALLIFS agent? *
                </label>

                <textarea
                  id="motivation"
                  name="motivation"
                  value={form.motivation}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell us about your motivation, goals and what you can bring to the STALLIFS agent network."
                />
              </div>
            </div>
          </div>

          {/* ==================================================
              DOCUMENTS
          =================================================== */}

          <div className="form-section">
            <div className="form-section__heading">
              <span>03</span>

              <div>
                <h2>Supporting Documents</h2>
                <p>
                  Upload the documents required for your application.
                </p>
              </div>
            </div>

            <div className="document-grid">
              <DocumentUpload
                name="cv"
                label="CV"
                required
                file={files.cv}
                onChange={handleFileChange}
              />

              <DocumentUpload
                name="nationalIdDocument"
                label="National ID Document"
                required
                file={files.nationalIdDocument}
                onChange={handleFileChange}
              />

              <DocumentUpload
                name="kraCertificate"
                label="KRA Certificate"
                required
                file={files.kraCertificate}
                onChange={handleFileChange}
              />

              <DocumentUpload
                name="iraCertificate"
                label="IRA Certificate"
                file={files.iraCertificate}
                onChange={handleFileChange}
              />

              <DocumentUpload
                name="goodConduct"
                label="Certificate of Good Conduct"
                file={files.goodConduct}
                onChange={handleFileChange}
              />

              <DocumentUpload
                name="otherDocument"
                label="Other Supporting Document"
                file={files.otherDocument}
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* ==================================================
              SUBMISSION
          =================================================== */}

          <div className="application-submit">
            <div>
              <h3>Ready to submit?</h3>

              <p>
                Please make sure the information you have
                provided is accurate before submitting your
                application.
              </p>
            </div>

            <button
              type="submit"
              className="button button--primary"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Application"}

              {!submitting && (
                <ArrowRight size={18} />
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function DocumentUpload({
  name,
  label,
  required = false,
  file,
  onChange,
}) {
  return (
    <div className="document-upload">
      <label htmlFor={name}>
        <span className="document-upload__icon">
          <Upload size={21} />
        </span>

        <span className="document-upload__content">
          <strong>
            {label}
            {required ? " *" : ""}
          </strong>

          <small>
            {file
              ? file.name
              : "Choose a document to upload"}
          </small>
        </span>
      </label>

      <input
        id={name}
        name={name}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={onChange}
        required={required}
      />
    </div>
  );
}

export default ApplyAgentPage;