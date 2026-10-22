/**
 * Approved client quotes for case studies. Empty until a real quote exists.
 * Do not invent a sentence, a name, or a result.
 */
export type ClientQuote = {
  text: string;
  attribution: string;
};

export const caseStudyQuotes: Partial<Record<string, ClientQuote>> = {};
