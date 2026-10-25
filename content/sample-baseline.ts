/**
 * A labeled example of the written savings baseline. Fieldstone Casework
 * is made up. The $4,000 / $1,000 / $3,000 lines match the published
 * illustration. The baseline and measured-cost inputs are made up so the
 * worksheet can show the subtraction. Do not add a duration or a maximum
 * fee. Do not present this as a client.
 */
export const sampleBaseline = {
  path: "/sample-savings-baseline",
  pdfPath: "/sample-savings-baseline.pdf",
  updated: "2026-10-25",
  label: "Example only",
  business: "Fieldstone Casework",
  task: "Preparing a custom quote",
  title: "Example savings baseline",
  description:
    "An example of the measured baseline agreed in writing before a savings-share engagement. Fieldstone Casework is a made-up business. Example only. Not a client result.",
  kicker: "Example only",
  heading: "What a measured baseline looks like.",
  lede: "This worksheet is an example of the baseline we agree in writing before a savings-share engagement. Fieldstone Casework is a made-up business. This is not a client, not a quote, and not a result.",
  linkLabel: "See an example baseline worksheet",
  sections: [
    {
      title: "What gets measured",
      paragraphs: [
        "One named task whose cost can be counted. On this example the task is preparing a custom quote at Fieldstone Casework.",
        "The baseline is the monthly cost of that task, written down before work starts. After the workflow is in use, the same cost is measured again. Savings are the difference between those two amounts. The measurement is reviewed together.",
        "If the cost cannot be counted, we quote a price instead of a share.",
      ],
    },
    {
      title: "Who signs off",
      paragraphs: [
        "Before work starts, we agree the measured baseline with you in writing.",
        "On this example, the person who signs is the person at Fieldstone Casework who approves the spend. That role is part of the made-up business. It is not a real signer.",
        "Each month, that person and Adtell.ai review the measurement together before the fee is billed.",
      ],
    },
    {
      title: "How the monthly 25% is calculated",
      paragraphs: [
        "The monthly fee is 25% of the measured savings for that month. The business keeps the other 75%. Billing is monthly on the measured savings.",
      ],
    },
  ],
  rows: [
    {
      label: "Baseline monthly cost of the named task",
      amount: "$16,000",
      note: "Made up for this example.",
    },
    {
      label: "Measured monthly cost after the workflow is in use",
      amount: "$12,000",
      note: "Made up for this example.",
    },
    {
      label: "Measured savings",
      amount: "$4,000",
      note: "Baseline minus the measured cost.",
    },
    {
      label: "Monthly fee, 25% of measured savings",
      amount: "$1,000",
      note: "The business pays this amount.",
    },
    {
      label: "Amount the business keeps",
      amount: "$3,000",
      note: "The other 75% of the measured savings.",
    },
  ],
  close:
    "The $4,000, $1,000, and $3,000 lines match the illustration already published on the site. The $16,000 baseline and the $12,000 measured cost are made up so this worksheet can show the subtraction. Fieldstone Casework is a made-up business. Example only. Not a client result.",
} as const;
