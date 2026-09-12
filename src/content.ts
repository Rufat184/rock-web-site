// ---------------------------------------------------------------------------
// EDIT THIS FILE to make the site yours.
// All names, dates, tracks and gear shown on the site live here.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// SECTION: ARTIST — identity, bio & contact
// Used by: Hero, About, Contact, Footer (name, tagline, bio, email, socials)
// ---------------------------------------------------------------------------
export const artist = {
  name: "STRUM DANA",
  role: "BASSIST",
  tagline: "Official Website",
  heroLine: "FIVE STRINGS. NO FILLER.",
  bio: [
    "Dana Strum has spent a decade on the low end of rock — from smoky basement shows to sold-out festival stages. Known for a groovy, punchy tone and riffs that refuse to sit still, he anchors the band while pushing it into strange new places.",
    "Off stage you'll find him restoring vintage basses, chasing perfect drive on a practice rig, and arguing (passionately) that the bass is the most underrated instrument in rock.",
  ],
  email: "booking@dana-strum.example",
  socials: [
    { label: "Instagram", url: "https://instagram.com" },
    { label: "YouTube", url: "https://youtube.com" },
    { label: "Bandcamp", url: "https://bandcamp.com" },
  ],
};

// ---------------------------------------------------------------------------
// SECTION: TOUR — upcoming show dates
// Used by: Tour section (date, city, venue, country, soldOut badge)
// ---------------------------------------------------------------------------
export type TourDate = {
  date: string; // e.g. "SEP 12"
  city: string;
  venue: string;
  country: string;
  soldOut?: boolean;
};

export const tourDates: TourDate[] = [
  { date: "SEP 12", city: "Tbilisi", venue: "Bassiani", country: "Georgia" },
  { date: "SEP 15", city: "Baku", venue: "Muzey", country: "Azerbaijan" },
  { date: "OCT 03", city: "Istanbul", venue: "Babylon", country: "Türkiye" },
  { date: "OCT 10", city: "Berlin", venue: "Astra Kulturhaus", country: "Germany", soldOut: true },
  { date: "OCT 17", city: "Amsterdam", venue: "Paradiso", country: "Netherlands" },
  { date: "NOV 01", city: "London", venue: "O2 Academy Brixton", country: "United Kingdom" },
];

// ---------------------------------------------------------------------------
// SECTION: MUSIC — track list & riff data
// Used by: Music section + RiffPlayer (each track's riff is synthesized
// live via Web Audio — notes are MIDI numbers, E1 = 28, no audio files)
// ---------------------------------------------------------------------------
export type Track = {
  title: string;
  year: string;
  album: string;
  riff: number[]; // midi notes
  tempo: number; // ms per 16th note
};

export const tracks: Track[] = [
  {
    title: "Static Bloom",
    year: "2026",
    album: "Low Theory",
    tempo: 90,
    riff: [40, 40, 43, 40, 47, 43, 45, 43, 40, 40, 38, 40, 43, 45, 47, 50],
  },
  {
    title: "Concrete Sun",
    year: "2024",
    album: "Low Theory",
    tempo: 100,
    riff: [45, 45, 48, 45, 50, 48, 45, 45, 41, 41, 44, 41, 45, 48, 50, 53],
  },
  {
    title: "Wires & Smoke",
    year: "2022",
    album: "Voltage",
    tempo: 80,
    riff: [38, 41, 38, 44, 42, 41, 38, 36, 38, 41, 44, 46, 45, 44, 41, 38],
  },
  {
    title: "Half Light",
    year: "2021",
    album: "Voltage",
    tempo: 110,
    riff: [43, 43, 46, 43, 50, 46, 48, 46, 43, 43, 41, 43, 46, 50, 53, 55],
  },
];

// ---------------------------------------------------------------------------
// SECTION: BASS NECK — string tuning for the interactive neck
// Used by: BassNeck component (clickable 4-string pluck)
// ---------------------------------------------------------------------------
export type BassString = {
  name: string; // label shown on the neck
  midi: number; // open-string MIDI note
};

// Standard 4-string tuning, low to high: E1 A1 D2 G2.
export const bassStrings: BassString[] = [
  { name: "E", midi: 28 },
  { name: "A", midi: 33 },
  { name: "D", midi: 38 },
  { name: "G", midi: 43 },
];

// ---------------------------------------------------------------------------
// SECTION: GEAR — equipment list
// Used by: Gear section (name, type, note for each item)
// ---------------------------------------------------------------------------
export type GearItem = {
  name: string;
  type: string;
  note: string;
};

export const gear: GearItem[] = [
  { name: "Gretsch G2120 Stealth", type: "Signature Bass", note: "The main weapon — warm, woody, huge." },
  { name: "Fender '76 Precision", type: "Vintage", note: "For when the song asks for classic." },
  { name: "Jazz SLap (5-string)", type: "5-String", note: "Extended low B for festival-sized riffs." },
  { name: "Trace Elliot 115", type: "Amp", note: "One-knob punch. Tour-proven." },
];
