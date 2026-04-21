module.exports = {
  announcement: {
    items: [
      {
        date: 'March 31',
        parts: [
          { type: 'text', value: 'We added two new benchmarks and published the ' },
          { type: 'link', label: 'Winter 2025 Leaderboard', href: '#' },
          { type: 'text', value: ' and ' },
          { type: 'link', label: 'Summer 2025 Leaderboard', href: '#' },
          { type: 'text', value: '.' }
        ]
      },
      {
        date: 'March 31',
        parts: [
          { type: 'text', value: 'The ' },
          { type: 'link', label: 'Summer Open 2026', href: '#' },
          { type: 'text', value: ' benchmark is now live and accepting submissions.' }
        ]
      }
    ]
  },
  introduction: {
    title: 'About CT Open',
    paragraphs: [
      'Scientists have long sought to accurately predict outcomes of real-world events before they happen. Can AI systems do so more reliably? We study this question through clinical trial outcome prediction, a high-stakes open challenge even for domain experts, with immediate consequences for patients, pharmaceutical companies, and investors.',
      'We introduce CT Open, an open-access live platform that runs four challenge cycles every year. Anyone can submit predictions for clinical trial outcomes in each challenge cycle. In the next cycle, CT Open evaluates those submissions on trials whose outcomes were not yet public at the submission deadline but became public afterward.',
      'Determining if a trial\'s outcome is public on the internet before a certain date is surprisingly difficult. Outcomes posted on official registries may lag behind years, while the first mention may appear in obscure news articles. To address this, we propose a novel, fully automated pipeline that uses iterative LLM-powered web search to identify the earliest mention of trial outcomes.',
      'We validate the pipeline\'s quality and accuracy using human expert annotations. Since CT Open\'s pipeline ensures that every evaluated trial had no publicly reported outcome when the prediction was made, it allows participants to use any methodology and any data source.',
      'In this paper, we release a large-scale training set and two time-stamped test benchmarks, Winter25 and Summer25. We present promising results showing that retrieval-augmented and agentic LLMs outperform baseline methods. We believe CT Open can serve as a central hub for advancing AI research on forecasting real-world outcomes before they occur, while also informing biomedical research and improving clinical trial design.'
    ],
    links: [
      { label: 'Code', href: '#' },
      { label: 'Report / PDF', href: '#' }
    ]
  },
  faq: [
    {
      question: 'How are the leaderboard metrics organized?',
      answer: 'CT Open reports results separately for three question categories: Endpoint, Superiority, and Comparative Effect. For each category, the leaderboard shows Macro-F1 and Balanced Accuracy so participants can compare performance across the different prediction tasks.'
    },
    {
      question: 'What does Balanced Accuracy mean in this table?',
      answer: 'Balanced Accuracy is the average of a model\'s accuracy on the positive class and its accuracy on the negative class. It is useful when the class distribution is imbalanced because it prevents the larger class from dominating the score.'
    },
    {
      question: 'Why are some benchmarks open for submission but do not yet show results?',
      answer: 'Open benchmarks intentionally hide the final leaderboard until the submission window closes and ground-truth answers are ready to publish. This prevents leakage and ensures everyone is evaluated against the same final answer key.'
    },
    {
      question: 'How do you validate a submission file?',
      answer: 'Each uploaded JSON is validated in layers: authenticated request checks, JSON parsing, schema validation, and semantic validation against the canonical benchmark manifest. The server rejects missing required problems, unknown IDs, invalid option formats, and invalid options.'
    },
    {
      question: 'What should the submission JSON look like?',
      answer: 'The platform expects a JSON object where each key is a question ID and each value is a non-empty option list. All option lists must have the same length. Non-inferiority questions allow a, b, and c, while other questions allow only a and b.'
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
      answer: 'Please use the Contact page on the website to reach the team.'
    },
    {
      question: 'When will the 26/06 Benchmark leaderboard be published?',
      answer: 'The 26/06 Benchmark leaderboard appears after the submission window closes and results are published according to its benchmark schedule. Until then, the tab remains submission-focused and your latest valid upload is kept as your active submission.'
    }
  ]
}
