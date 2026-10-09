
import { useState } from 'react';
import './Feedback.css';

function Feedback() {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (rating === 0) {
      alert('Please select a star rating.');
      return;
    }

    const form = event.currentTarget;

    const data = {
      name: form.elements.name.value.trim(),
      projectType: form.elements.projectType.value,
      rating: rating,
      message: form.elements.feedback.value.trim()
    };

    if (
      !data.name ||
      !data.projectType ||
      !data.message
    ) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'https://construction-production-ea89.up.railway.app/api/feedback',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Failed to save feedback.'
        );
      }

      setSubmitted(true);
      form.reset();
      setRating(0);
    } catch (error) {
      console.error('Feedback error:', error);

      alert(
        error.message ||
          'Cannot connect to backend. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="feedback-page">
      <section className="feedback-hero">
        <div className="site-container feedback-hero-inner">
          <div>
            <span className="eyebrow">
              <span /> WORDS FROM OUR CLIENTS
            </span>

            <h1>
              Good work is
              <br />
              better <em>together.</em>
            </h1>

            <p>
              Every project is personal. We’re grateful when our clients
              share what the journey felt like for them.
            </p>
          </div>

          <div className="feedback-hero-image">
            <img
              src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1100&q=85"
              alt="Bright contemporary living room with natural finishes"
            />
          </div>
        </div>
      </section>

      <section className="feedback-form-section">
        <div className="site-container feedback-form-layout">
          <div className="feedback-form-intro">
            <span className="eyebrow">
              <span /> YOUR EXPERIENCE MATTERS
            </span>

            <h2>
              Tell us how
              <br />
              we <em>did.</em>
            </h2>

            <p>
              We’re always learning. If we’ve had the pleasure of working
              together, we’d love to hear what stood out to you.
            </p>

            <div className="feedback-thanks">
              Thank you for being part of the Oak &amp; Stone story.
            </div>
          </div>

          <div className="feedback-form-card">
            {submitted ? (
              <div className="feedback-success" role="status">
                <span className="success-icon" aria-hidden="true">
                  ✓
                </span>

                <span className="eyebrow">
                  <span /> THANK YOU
                </span>

                <h2>
                  Your words
                  <br />
                  <em>mean a lot.</em>
                </h2>

                <p>
                  Thanks for taking the time to share your experience
                  with Oak &amp; Stone.
                </p>

                <button
                  type="button"
                  className="text-link feedback-reset"
                  onClick={() => {
                    setSubmitted(false);
                    setRating(0);
                  }}
                >
                  Leave another note <span>↗</span>
                </button>
              </div>
            ) : (
              <form
                className="feedback-form"
                onSubmit={handleSubmit}
              >
                <label className="rating-label">
                  How was your experience?
                </label>

                <div
                  className="rating-buttons"
                  role="group"
                  aria-label="Rate your experience from 1 to 5 stars"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} star${star === 1 ? '' : 's'}`}
                      aria-pressed={rating === star}
                      className={
                        star <= rating
                          ? 'rating-star selected'
                          : 'rating-star'
                      }
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}

                  <span>
                    {rating ? `${rating} out of 5` : 'Choose a rating'}
                  </span>
                </div>

                <label>
                  Your name
                  <input
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Smith"
                    required
                  />
                </label>

                <label>
                  Project type
                  <select
                    name="projectType"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    <option>Custom home</option>
                    <option>Renovation or addition</option>
                    <option>Commercial construction</option>
                    <option>Design &amp; build</option>
                    <option>Property development</option>
                    <option>Project management</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Your feedback
                  <textarea
                    name="feedback"
                    rows="4"
                    placeholder="What did you enjoy? What could we do better?"
                    required
                  />
                </label>

                {rating === 0 && (
                  <span className="rating-hint">
                    Please choose a star rating before sharing.
                  </span>
                )}

                <button
                  type="submit"
                  className="button-primary"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Share your feedback'}
                  {!loading && <span>↗</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Feedback;
