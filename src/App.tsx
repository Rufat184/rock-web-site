import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { artist, tourDates, tracks, gear } from "./content";
import { useReveal } from "./hooks/useReveal";
import { RiffPlayer, startRiff, stopRiff, subscribeRiff } from "./components/RiffPlayer";
import { BassNeck } from "./components/BassNeck";
import { ParticleBass } from "./components/ParticleBass";
import { Ticker } from "./components/Ticker";

const delay = (ms: number) => ({ "--reveal-delay": ms } as CSSProperties);

export default function App() {
  const rootRef = useReveal();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="site" ref={rootRef}>
      <Nav scrolled={scrolled} />
      <main>
        <Hero />
        <Ticker
          items={[
            "Dana Strum — Live 2026",
            "Five strings, no filler",
            "New album: Low Theory",
            "All low end",
          ]}
        />
        <About />
        <Tour />
        <Music />
        <Gear />
        <Contact />
      </main>
      <Footer />
      <NowPlaying />
    </div>
  );
}

/* ---------------------------------- Nav --------------------------------- */

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#tour", label: "Tour" },
  { href: "#music", label: "Music" },
  { href: "#gear", label: "Gear" },
  { href: "#contact", label: "Contact" },
];

function Nav({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className={`nav${scrolled || open ? " nav--solid" : ""}`}>
      <a className="nav__brand" href="#top" onClick={() => setOpen(false)}>
        <i aria-hidden="true" />
        {artist.name}
      </a>
      <button
        className="nav__toggle"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`nav__toggle-bar${open ? " is-x1" : ""}`} />
        <span className={`nav__toggle-bar${open ? " is-x2" : ""}`} />
      </button>
      <nav className={`nav__links${open ? " nav__links--open" : ""}`}>
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a className="nav__book" href="#contact" onClick={() => setOpen(false)}>
          Booking
        </a>
      </nav>
    </header>
  );
}

/* --------------------------------- Hero --------------------------------- */

function Hero() {
  const [playing, setPlaying] = useState(false);
  const [first, ...rest] = artist.name.split(" ");
  const last = rest.join(" ");

  useEffect(() => subscribeRiff((id) => setPlaying(id === tracks[0].title)), []);

  return (
    <section className="hero" id="top">
      <div className="hero__halftone" aria-hidden="true" />
      <ParticleBass className="hero__morph" anchor=".hero__inner" />
      <div className="hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow" data-reveal>
            {artist.tagline} — EST. 2014
          </p>
          <h1 className="hero__name">
            <span className="hero__name-line" data-reveal style={delay(60)}>
              {first}
            </span>
            <span
              className="hero__name-line hero__name-line--outline"
              data-t={last}
              data-reveal
              style={delay(160)}
            >
              {last}
            </span>
          </h1>
          <p className="hero__role" data-reveal style={delay(260)}>
            {artist.role}
          </p>
          <p className="hero__line" data-reveal style={delay(320)}>
            {artist.heroLine}
          </p>
          <div className="hero__cta" data-reveal style={delay(380)}>
            <a className="btn" href="#tour">
              Tour Dates ↓
            </a>
            <button
              className={`btn btn--ghost${playing ? " is-on" : ""}`}
              onClick={() => startRiff(tracks[0])}
            >
              {playing ? "■ Stop it" : "▶ Hear the low end"}
            </button>
          </div>
        </div>
      </div>
      <Badge />
      <p className="hero__rail" aria-hidden="true">
        {tourDates.map((d) => d.city).join(" — ")}
      </p>
    </section>
  );
}

/** Vinyl record — spinning disc with grooves, sheen and a fluorescent label. */
function Badge() {
  return (
    <div className="hero__badge" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs>
          <path
            id="badge-circ"
            d="M 60,60 m -19,0 a 19,19 0 1,1 38,0 a 19,19 0 1,1 -38,0"
          />
        </defs>
        <g className="hero__badge-spin">
          <circle cx="60" cy="60" r="58" className="hero__badge-disc" />
          <circle cx="60" cy="60" r="52" className="hero__badge-groove" />
          <circle cx="60" cy="60" r="45" className="hero__badge-groove" />
          <circle cx="60" cy="60" r="38" className="hero__badge-groove" />
          <path d="M 18.4 36 A 48 48 0 0 0 18.4 84" className="hero__badge-sheen" />
          <path d="M 94.6 40 A 40 40 0 0 1 94.6 80" className="hero__badge-sheen" />
          <circle cx="60" cy="60" r="26" className="hero__badge-label" />
          <text className="hero__badge-text">
            <textPath href="#badge-circ">
              FIVE STRINGS ✶ EST. 2014 ✶
            </textPath>
          </text>
          <circle cx="60" cy="60" r="2.6" className="hero__badge-hole" />
        </g>
      </svg>
    </div>
  );
}

/* ------------------------------ Section head ---------------------------- */

function SectionHead({ title }: { title: string }) {
  return (
    <div className="section-head" data-reveal>
      <h2 className="section-head__title">{title}</h2>
    </div>
  );
}

/* -------------------------------- About --------------------------------- */

function About() {
  return (
    <section className="section" id="about">
      <SectionHead title="About" />
      <div className="about">
        <div className="about__bio">
          {artist.bio.map((p, i) => (
            <p key={i} className={`about__text${i === 0 ? " about__text--lead" : ""}`} data-reveal style={delay(i * 90)}>
              {p}
            </p>
          ))}
        </div>
        <dl className="about__stats" data-reveal style={delay(160)}>
          <div>
            <dt>Years on stage</dt>
            <dd>12</dd>
          </div>
          <div>
            <dt>Shows played</dt>
            <dd>480+</dd>
          </div>
          <div>
            <dt>Albums recorded</dt>
            <dd>2</dd>
          </div>
          <span className="stamp" aria-hidden="true">
            All low end
          </span>
        </dl>
      </div>
    </section>
  );
}

/* --------------------------------- Tour --------------------------------- */

function Tour() {
  return (
    <section className="section" id="tour">
      <SectionHead title="Tour Dates" />
      <BassNeck />
      <ul className="tour" role="list">
        {tourDates.map((d, i) => (
          <li
            key={d.date + d.city}
            className={`tour__row${d.soldOut ? " tour__row--soldout" : ""}`}
            data-reveal
            style={delay(i * 60)}
          >
            <div className="tour__stub">
              <span className="tour__date">{d.date}</span>
              <small>2026</small>
            </div>
            <div className="tour__body">
              <strong className="tour__city">{d.city}</strong>
              <span className="tour__venue">
                {d.venue} — {d.country}
              </span>
            </div>
            <div className="tour__action">
              {d.soldOut ? (
                <em className="tour__stamp">Sold Out</em>
              ) : (
                <a className="btn btn--sm" href="#contact">
                  Tickets →
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------ Discography ----------------------------- */

function Music() {
  return (
    <section className="section" id="music">
      <SectionHead title="Music" />
      <p className="section-sub" data-reveal>
        Tap a track to hear its bass line — synthesized live in your browser.
        The bars on the right are the actual riff, lit step by step.
      </p>
      <ul className="tracks" role="list">
        {tracks.map((t, i) => (
          <li key={t.title} className="track" data-reveal style={delay(i * 70)}>
            <span className="track__num" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <RiffPlayer track={t} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/* --------------------------------- Gear --------------------------------- */

function Gear() {
  return (
    <section className="section" id="gear">
      <SectionHead title="Gear" />
      <div className="gear-grid">
        {gear.map((g, i) => (
          <article className="gear-card" key={g.name} data-reveal style={delay(i * 80)}>
            <span className="gear-card__led" aria-hidden="true" />
            <h3 className="gear-card__name">{g.name}</h3>
            <p className="gear-card__type">{g.type}</p>
            <p className="gear-card__note">{g.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- Contact ------------------------------- */

function Contact() {
  return (
    <section className="section" id="contact">
      <SectionHead title="Contact" />
      <div className="contact">
        <div data-reveal>
          <p className="contact__label">Booking / press / bass talk</p>
          <a className="contact__email" href={`mailto:${artist.email}`}>
            {artist.email}
          </a>
        </div>
        <ul className="contact__socials" data-reveal style={delay(120)} role="list">
          {artist.socials.map((s) => (
            <li key={s.label}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------- Footer -------------------------------- */

function Footer() {
  return (
    <footer className="footer">
      <p className="footer__name" aria-hidden="true">
        {artist.name}
      </p>
      <div className="footer__meta">
        <span>
          © {new Date().getFullYear()} {artist.name}
        </span>
        <span>{artist.heroLine}</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}

/* ----------------------------- Now playing ------------------------------ */

function NowPlaying() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => subscribeRiff(setId), []);
  if (!id) return null;
  return (
    <div className="nowplaying" role="status">
      <span className="nowplaying__dot" aria-hidden="true" />
      <span className="nowplaying__label">Now playing — {id}</span>
      <button className="nowplaying__stop" onClick={stopRiff} aria-label="Stop playback">
        ■
      </button>
    </div>
  );
}
