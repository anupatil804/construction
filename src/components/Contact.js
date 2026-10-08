import React, { useState } from "react";
import "./Contact.css";

function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const data = {
      name: form.elements.namedItem("name").value,
      email: form.elements.namedItem("email").value,
      phone: form.elements.namedItem("phone").value,
      projectType: form.elements.namedItem("projectType").value,
      message: form.elements.namedItem("message").value
    };

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Contact submitted successfully!");
        console.log("Saved:", result);
        form.reset();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-heading">
        <div className="site-container">
          <span className="eyebrow"><span /> LET’S START A CONVERSATION</span>
          <h1>Tell us about<br /><em>your project.</em></h1>
          <p>Have an idea taking shape? Share a few details and our team will help you figure out the next step.</p>
        </div>
        <span className="contact-heading-mark" aria-hidden="true">O.</span>
      </section>

      <section className="section-space">
        <div className="site-container contact-layout">
          <aside className="contact-info">
            <span className="eyebrow"><span /> HERE WHEN YOU NEED US</span>
            <h2>Good things<br />start with <em>hello.</em></h2>
            <p>Whether you have detailed plans or just the beginning of an idea, we’d love to hear what you’re thinking about.</p>

            <div className="contact-detail">
              <span className="contact-detail-icon" aria-hidden="true">↗</span>
              <div>
                <span>Email us</span>
                <a href="mailto:hello@oakandstonebuild.com">hello@oakandstonebuild.com</a>
              </div>
            </div>
            <div className="contact-detail">
              <span className="contact-detail-icon" aria-hidden="true">◷</span>
              <div>
                <span>Office hours</span>
                <span>Mon – Fri, 8:00am – 6:00pm</span>
              </div>
            </div>
            <div className="contact-detail">
              <span className="contact-detail-icon" aria-hidden="true">⌖</span>
              <div>
                <span>Where we build</span>
                <span>Serving the greater metro area</span>
              </div>
            </div>
            <div className="contact-note">
              No pressure, no hard sell. Just a thoughtful first conversation about what matters to you.
            </div>
          </aside>

          <div className="contact-form-panel">
            <div className="form-panel-heading">
              <span>PROJECT ENQUIRY</span>
              <span>WE’LL BE IN TOUCH SOON</span>
            </div>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>
                  Your name
                  <input type="text" name="name" placeholder="Enter your name" autoComplete="name" required />
                </label>
                <label>
                  Email address
                  <input type="email" name="email" placeholder="Enter your email" autoComplete="email" required />
                </label>
              </div>
              <div className="form-row">
                <label>
                  <span>Phone number <span className="optional-label">OPTIONAL</span></span>
                  <input type="tel" name="phone" placeholder="Enter your phone number" autoComplete="tel" />
                </label>
                <label>
                  Project type
                  <select name="projectType" defaultValue="" required>
                    <option value="" disabled>Select Project Type</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Renovation">Renovation</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>
              <label>
                Message
                <textarea name="message" rows="5" placeholder="Tell us about your project..." required />
              </label>
              <div className="form-submit-row">
                <span>Your details stay private with our team.</span>
                <button type="submit" className="button-primary" disabled={loading}>
                  {loading ? "Sending..." : "Send your enquiry"} <span aria-hidden="true">↗</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
