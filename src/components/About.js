import { Link } from 'react-router-dom';
import './About.css';

const values = [
  { number: '01', title: 'People before projects', text: 'We build around real people and the way they live, work and gather.' },
  { number: '02', title: 'The details matter', text: 'Thoughtful planning and careful finishes make the difference you can feel.' },
  { number: '03', title: 'Do what we say', text: 'Straight answers, clear timelines and a team you can count on.' },
];

function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85" alt="Distinctive contemporary home designed with warm natural materials" />
        <div className="about-hero-shade" />
        <div className="site-container about-hero-copy">
          <span className="eyebrow about-hero-eyebrow"><span /> A LITTLE ABOUT US</span>
          <h1>We build places<br />to <em>belong.</em></h1>
          <p>Good spaces change how everyday life feels. We’re here to make more of them.</p>
        </div>
        <span className="about-hero-caption">Oak &amp; Stone Build Co. · Building with intention</span>
      </section>

      <section className="about-story section-space">
        <div className="site-container about-story-grid">
          <div className="about-story-label"><span className="eyebrow"><span /> OUR STORY</span><span className="story-year">EST. 2009<br />BUILT ON TRUST</span></div>
          <div className="about-story-copy">
            <h2>We’re builders at heart.<br /><em>And people, first.</em></h2>
            <p>Oak &amp; Stone started with a simple idea: construction could feel more human. More listening, less guesswork. More care in the details. A team that treats your project like it matters—because it does.</p>
            <p>Today, we bring that same belief to every custom home, renovation and commercial space we take on. Our team works side by side with you, from the first conversation to the final walkthrough, making thoughtful choices and good work feel easy.</p>
            <Link to="/contact" className="text-link">Come say hello <span>↗</span></Link>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="site-container values-layout">
          <div className="values-intro">
            <span className="eyebrow"><span /> WHAT WE BELIEVE</span>
            <h2>Good things<br />start with<br /><em>good people.</em></h2>
            <p>The principles behind every plan, every conversation and every finished space.</p>
          </div>
          <div className="values-list">
            {values.map((value) => (
              <article className="value-row" key={value.number}>
                <span className="value-number">{value.number}</span>
                <div><h3>{value.title}</h3><p>{value.text}</p></div>
                <span className="value-plus" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-image-band">
        <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=85" alt="Bright modern home interior with thoughtful architectural details" />
        <div className="about-image-caption"><span>GOOD THINGS ARE BUILT TOGETHER.</span><span>That’s the Oak &amp; Stone way.</span></div>
      </section>

      <section className="about-numbers section-space">
        <div className="site-container numbers-inner">
          <div><strong>15<span>+</span></strong><span>years of doing good work</span></div>
          <div><strong>120</strong><span>projects with a story to tell</span></div>
          <div><strong>1</strong><span>team that’s here for you</span></div>
          <div className="numbers-cta"><span className="eyebrow"><span /> YOUR PROJECT, NEXT</span><h2>Let’s make<br /><em>something matter.</em></h2><Link to="/contact" className="text-link">Talk with our team <span>↗</span></Link></div>
        </div>
      </section>
    </div>
  );
}

export default About;
