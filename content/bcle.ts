/**
 * BCLE Furniture is the example client. BespokeQuote.furniture is the
 * quoting and inventory system Adtell.ai delivered. No prices or results.
 */
export type BcleShot = {
  name: string;
  alt: string;
  caption: string;
};

export const deliveredLead =
  "Adtell.ai delivered BespokeQuote.furniture to BCLE Furniture to automate their quoting and inventory management.";

export const bcleCaseStudy = {
  slug: "bcle-furniture-bespokequote",
  path: "/case-studies/bcle-furniture-bespokequote",
} as const;

export const bcleCaseStudyShots = [
  {
    name: "bespokequote-how-it-works",
    alt: "BespokeQuote.furniture steps from sending drawings to a reviewed quote, a purchase order, and delivery tracking",
    caption: "From a drawing set to delivery",
  },
  {
    name: "bespokequote-dashboard",
    alt: "BespokeQuote.furniture dashboard with a project package, quote lines, and order actions",
    caption: "The quoting dashboard",
  },
  {
    name: "bespokequote-home",
    alt: "BespokeQuote.furniture home page with steps from uploading drawings to a reviewed quote and delivery tracking",
    caption: "The public BespokeQuote.furniture page",
  },
] as const satisfies readonly BcleShot[];

export const bcleHero = {
  name: "bespokequote-dashboard",
  alt: "BespokeQuote.furniture dashboard with a project package, quote lines, and order actions",
  caption:
    "BespokeQuote.furniture, the quoting and inventory system Adtell.ai delivered for BCLE Furniture",
} as const satisfies BcleShot;

export const bcleShop = {
  kicker: "BespokeQuote.furniture",
  heading: "Delivered for BCLE Furniture",
  lede: deliveredLead,
  photos: [
    {
      name: "bespokequote-dashboard",
      alt: "BespokeQuote.furniture dashboard with a project package, quote lines, and order actions",
      caption: "The quoting dashboard",
    },
    {
      name: "bespokequote-how-it-works",
      alt: "BespokeQuote.furniture steps from sending drawings to a reviewed quote, a purchase order, and delivery tracking",
      caption: "From a drawing set to delivery",
    },
    {
      name: "bcle-ai-cut-sheet-receiving-tag",
      alt: "Blurred receiving tag prepared for inventory at BCLE Furniture",
      caption: "A blurred receiving tag for inventory",
    },
  ] as const satisfies readonly BcleShot[],
};

export const bcleAbout = {
  photo: {
    name: "bespokequote-dashboard",
    alt: "BespokeQuote.furniture dashboard with a project package, quote lines, and order actions",
    caption:
      "BespokeQuote.furniture, the quoting and inventory system Adtell.ai delivered for BCLE Furniture",
  } as const satisfies BcleShot,
  kicker: "Where the practice started",
  heading: "Inside BCLE Furniture",
  lede: "Chris runs BCLE Furniture, a working casework and millwork shop. BespokeQuote.furniture is the quoting and inventory system delivered there.",
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
      name: "bcle-burkle-operator",
      alt: "A person feeding panels into the Burkle finishing line at BCLE Furniture",
      caption: "Feeding panels into the Burkle",
    },
  ] as const satisfies readonly BcleShot[],
};

export const bcleDelivery = {
  screenshots: [
    {
      name: "bespokequote-dashboard",
      alt: "BespokeQuote.furniture dashboard with a project package, quote lines, and order actions",
      caption: "The quoting dashboard",
    },
    {
      name: "bespokequote-how-it-works",
      alt: "BespokeQuote.furniture steps from sending drawings to a reviewed quote, a purchase order, and delivery tracking",
      caption: "From a drawing set to delivery",
    },
  ] as const satisfies readonly BcleShot[],
  inventoryHeading: "The inventory side",
  inventory: "AI-prepared cut sheets and receiving tags.",
  sheets: [
    {
      name: "bcle-ai-cut-sheet-nesting",
      alt: "Blurred AI nesting sheet for the CNC at BCLE Furniture",
      caption: "AI-prepared nesting sheet",
    },
    {
      name: "bcle-ai-cut-sheet-receiving-tag",
      alt: "Blurred receiving tag prepared for inventory at BCLE Furniture",
      caption: "AI-prepared receiving tag",
    },
  ] as const satisfies readonly BcleShot[],
  blurNote: "Client and job names are blurred.",
};
