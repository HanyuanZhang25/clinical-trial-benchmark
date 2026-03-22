module.exports = {
  introduction: {
    title: 'What is Clinical Trial Arena?',
    paragraphs: [
      'Clinical Trial Arena is a benchmark platform for comparing how well models solve structured clinical-trial reasoning tasks. Each benchmark cycle publishes a canonical question set, a submission window, and a standardized leaderboard so teams can compare results on the same problems under the same reporting rules.',
      'Benchmark evaluation on this site means your submission is validated against the official benchmark manifest, stored with benchmark-version metadata, and later compared using consistent metrics such as Average F1 Macro and Cross Entropy. This keeps benchmark releases reproducible across cycles instead of mixing results from incompatible task definitions.',
      'Leaderboards and submission history make model comparisons more useful because they preserve fair comparisons across teams, model versions, and benchmark releases. Some benchmark tabs publish results only after ground-truth answers become available, so open benchmarks focus on download and submission flow first and leaderboard publication later.'
    ],
    links: [
      { label: 'Code', href: '#' },
      { label: 'Report / PDF', href: '#' }
    ]
  },
  faq: [
    {
      question: 'How exactly do you compute Average F1 Macro?',
      answer: 'Average F1 Macro is computed by calculating F1 for each benchmark subtask category independently and then averaging those category scores with equal weight. This avoids over-rewarding categories with more rows and keeps the headline score comparable across benchmark releases.'
    },
    {
      question: 'What does Cross Entropy mean in this table?',
      answer: 'Cross Entropy measures how well a model assigns probability mass to the correct label. Lower values are better. In Clinical Trial Arena, we display it next to F1 so the leaderboard captures both discrete prediction quality and confidence calibration.'
    },
    {
      question: 'How is the cost calculated?',
      answer: 'Cost is reported by submitters as the total benchmark inference cost for the uploaded run. The MVP stores the submitted numeric value directly so teams can compare accuracy-quality tradeoffs alongside benchmark metrics.'
    },
    {
      question: 'Why are some benchmarks open for submission but do not yet show results?',
      answer: 'Open benchmarks intentionally hide the final leaderboard until the submission window closes and ground-truth answers are ready to publish. This prevents leakage and ensures everyone is evaluated against the same final answer key.'
    },
    {
      question: 'How do you validate a submission file?',
      answer: 'Each uploaded JSON is validated in layers: authenticated request checks, JSON parsing, schema validation, and semantic validation against the canonical benchmark manifest. The server rejects duplicate problem IDs, missing required problems, unknown IDs, and invalid cost values.'
    },
    {
      question: 'What should the submission JSON look like?',
      answer: 'The MVP expects a JSON object with benchmark_version, answers, and total_cost. answers must be a list of objects that each include problem_id and answer. The benchmark version is human-readable, but the backend resolves it to a stable benchmark record internally.'
    },
    {
      question: 'Can I submit multiple times?',
      answer: 'Yes. The platform stores each submission attempt in your personal history. Open benchmarks may accept multiple submissions during the submission window, while published leaderboards remain read-only.'
    },
    {
      question: 'Why do some benchmark tabs have tables while others only have a submission call?',
      answer: 'Tabs are driven by benchmark lifecycle state. Published benchmarks render historical result tables, while open benchmarks render download and submission actions. As each cycle closes and results are published, that tab changes from submission mode into leaderboard mode.'
    },
    {
      question: 'How can I contact the team?',
      answer: 'For the MVP, use the placeholder contact workflow referenced in the site footer or report link. In a production deployment, this would typically route through a monitored team email alias or support form.'
    },
    {
      question: 'When will the 26/06 Benchmark leaderboard be published?',
      answer: 'The 26/06 Benchmark leaderboard appears after the submission window closes and results are published according to its benchmark schedule. Until then, the tab remains submission-focused and your uploads are stored as pending results.'
    }
  ]
};
