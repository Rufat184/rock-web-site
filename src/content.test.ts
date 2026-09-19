import { describe, expect, it } from "vitest";
import { artist, bassStrings, gear, tourDates, tracks } from "./content";

describe("content", () => {
  it("has artist contact details", () => {
    expect(artist.email).toMatch(/@.*\./);
    expect(artist.socials.length).toBeGreaterThan(0);
  });

  it("has tour dates with all fields filled", () => {
    expect(tourDates.length).toBeGreaterThan(0);
    for (const d of tourDates) {
      expect(d.date).toBeTruthy();
      expect(d.city).toBeTruthy();
      expect(d.venue).toBeTruthy();
      expect(d.country).toBeTruthy();
    }
  });

  it("has one 16-step riff per track, in bass range", () => {
    for (const t of tracks) {
      expect(t.riff).toHaveLength(16);
      for (const midi of t.riff) expect(midi).toBeGreaterThanOrEqual(24);
      expect(t.tempo).toBeGreaterThan(0);
    }
  });

  it("tunes the neck E1 A1 D2 G2", () => {
    expect(bassStrings.map((s) => s.midi)).toEqual([28, 33, 38, 43]);
  });

  it("lists gear", () => {
    expect(gear.length).toBeGreaterThan(0);
  });
});
