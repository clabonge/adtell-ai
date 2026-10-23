/**
 * Captions for the approved BCLE Furniture photographs.
 * Model numbers already in the file names stay. Do not add a result or a count.
 */
export type BcleShot = {
  name: string;
  alt: string;
  caption: string;
};

export const bcleHero = {
  name: "bcle-selexx-cnc",
  alt: "Anderson Selexx 510 FL CNC at BCLE Furniture",
  caption: "Anderson Selexx 510 FL CNC at BCLE Furniture",
} as const satisfies BcleShot;

export const bcleShop = {
  kicker: "Real shops, real work",
  heading: "Built and proven at BCLE Furniture",
  lede: "These workflows run every day on the BCLE Furniture shop floor.",
  photos: [
    {
      name: "bcle-shop-floor",
      alt: "The BCLE Furniture shop floor, with machines and work in progress",
      caption: "The BCLE Furniture shop floor",
    },
    {
      name: "bcle-cnc-vacuum-lift",
      alt: "CNC vacuum pods lifting a cut panel at BCLE Furniture",
      caption: "CNC vacuum pods lifting a cut panel at BCLE",
    },
    {
      name: "bcle-burkle-operator",
      alt: "Panels going through the Burkle finishing line at BCLE Furniture",
      caption: "Panels going through the Burkle finishing line",
    },
  ] as const satisfies readonly BcleShot[],
};

export const bcleAbout = {
  photo: {
    name: "bcle-selexx-cnc",
    alt: "The Selexx 510 FL CNC at BCLE Furniture",
    caption: "The Selexx 510 FL CNC at BCLE Furniture.",
  } as const satisfies BcleShot,
  kicker: "Where the practice started",
  heading: "Inside BCLE Furniture",
  lede: "Chris runs BCLE Furniture, a working casework and millwork shop. It is where these AI workflows were built and proven on real jobs.",
  photos: [
    {
      name: "bcle-shop-floor",
      alt: "The shop floor at BCLE Furniture",
      caption: "The shop floor",
    },
    {
      name: "bcle-thermwood-cnc",
      alt: "Thermwood CNC router at BCLE Furniture",
      caption: "Thermwood CNC router",
    },
    {
      name: "bcle-burkle-finishing-line",
      alt: "Burkle finishing line at BCLE Furniture",
      caption: "Burkle finishing line",
    },
    {
      name: "bcle-burkle-operator",
      alt: "A person feeding panels into the Burkle finishing line at BCLE Furniture",
      caption: "Feeding panels into the Burkle",
    },
  ] as const satisfies readonly BcleShot[],
};

export const bcleInventory = {
  label: "BCLE Furniture",
  heading: "How BCLE Furniture runs inventory with AI",
  lede: "At BCLE Furniture, inventory notes on sheets the AI prepares: nesting layouts for the CNC and receiving tags that feed inventory. A person on the floor still checks the work.",
  banner: {
    name: "bcle-burkle-operator-racks",
    alt: "An operator at the Burkle line among panel racks at BCLE Furniture",
    caption: "An operator at the Burkle line among panel racks at BCLE Furniture",
  } as const satisfies BcleShot,
  sheets: [
    {
      name: "bcle-ai-cut-sheet-nesting",
      alt: "Blurred AI nesting sheet for the CNC at BCLE Furniture",
      caption: "AI-generated nesting sheet for the CNC",
    },
    {
      name: "bcle-ai-cut-sheet-receiving-tag",
      alt: "Blurred receiving tag prepared for inventory at BCLE Furniture",
      caption: "Receiving tag the AI reads to update inventory",
    },
  ] as const satisfies readonly BcleShot[],
  blurNote: "Client and job names are blurred.",
  pieceKicker: "From sheet to finished piece",
  piece: "Parts like these are cut on the CNC from the AI-prepared nesting sheets.",
  piecePhoto: {
    name: "bcle-cnc-cut-cabinet",
    alt: "A cabinet cut on the CNC at BCLE Furniture from nested sheets",
    caption: "A cabinet cut on the CNC at BCLE Furniture",
  } as const satisfies BcleShot,
};
