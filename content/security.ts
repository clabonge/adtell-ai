/**
 * Public security page. Access, providers, and retention only.
 * Do not add a certification or a compliance claim.
 */
export const securityPage = {
  path: "/security",
  updated: "2026-10-23",
  title: "Security",
  description:
    "The access we ask for, which AI providers may process data, how long we keep it, and how we remove access at the end.",
  lede: "Least access, accounts that stay yours, and a written name for any AI provider that processes your data.",
  sections: [
    {
      title: "Access we need",
      paragraphs: [
        "We ask for the least access the workflow needs. If a narrower role can do the work, we do not ask for an owner login.",
        "Accounts stay yours. You create them, you hold the credentials, and you can remove us. We work inside those accounts. We do not take them over.",
      ],
    },
    {
      title: "AI providers that may process data",
      paragraphs: [
        "The try-it preview on this site sends the industry and the description of the work you type to OpenAI. The preview is optional. Leave it unused and nothing is sent.",
        "On a paid project, any other AI provider that may process your data is chosen for that project and named in the written agreement. We do not add a provider in silence.",
      ],
    },
    {
      title: "What we keep",
      paragraphs: [
        "We keep only what the work needs. At the end of an engagement we delete that material or return it to you.",
      ],
    },
    {
      title: "When the engagement ends",
      paragraphs: [
        "We remove our access when the engagement ends. You can also remove it yourself from the accounts you own.",
      ],
    },
    {
      title: "NDA",
      paragraphs: [
        "An NDA is available on request. Email clabonge@adtell.ai and ask for one before the conversation if you want it in place first.",
      ],
    },
    {
      title: "No training on client data",
      paragraphs: [
        "We do not use client data to train AI models. On a paid engagement we use settings that keep client data out of provider training.",
      ],
    },
  ],
} as const;
