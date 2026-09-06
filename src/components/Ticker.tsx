/**
 * Ink marquee ticker — two identical groups on a max-content track,
 * translated by -50% for a seamless loop. Decorative (aria-hidden).
 *
 * The items are repeated inside each group until the group is wider than
 * the viewport, so the marquee never shows a gap — it runs endlessly.
 */
export function Ticker({ items }: { items: string[] }) {
  // Repeat the items until one group comfortably covers any screen width.
  const repeated: string[] = [];
  for (let r = 0; r < 6; r++) repeated.push(...items);

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {[0, 1].map((g) => (
          <span className="ticker__group" key={g}>
            {repeated.map((it, i) => (
              <span className="ticker__item" key={i}>
                {it} <b className="ticker__star">✶</b>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
