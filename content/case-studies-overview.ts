/**
 * Overview moved off the retired case study
 * /case-studies/running-our-companies-on-ai-agents.
 * The company list on this page is the list that page pointed at.
 */
export const caseStudiesOverview = {
  intro:
    "We help a business implement AI automation against a named task. A person at the business still reviews what the agent prepares.",
  sections: [
    {
      heading: "What we implemented, and why",
      paragraphs: [
        "Each engagement starts with a task the business already does by hand and already knows is slow. The first workflow is the one a careful person can describe: the next sales step, a class schedule, an inventory note, a booking reply, a tasting follow-up, a vendor reply, or a maintenance note. That is the place to start because the work repeats, the source material already exists, and a person can still check the result before it goes out.",
        "The agent takes that repeatable first pass. It drafts, looks up an answer the business has already written, moves information between tools, or prepares material a person still reviews. That person remains responsible for the customer, for anything that spends or collects money, and for anything that would be embarrassing or unsafe if it were wrong.",
      ],
    },
    {
      heading: "How a workflow gets chosen",
      paragraphs: [
        "We start from a named task, not from a model. One workflow is scoped until a careful person could follow the procedure. The scope includes what the agent may prepare. If the approval step cannot be described, the workflow does not ship.",
      ],
    },
  ],
} as const;
