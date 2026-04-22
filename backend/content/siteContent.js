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
      question: 'What is a benchmark cycle?',
      answer: 'CT Open runs four benchmark cycles each year — Winter Open, Spring Open, Summer Open, and Fall Open — with each cycle covering a three-month window and a fixed set of clinical trial prediction questions. Participants submit predictions before that cycle’s evaluation window begins. After the window ends, CT Open identifies the subset of trials that had no publicly available results before the window but obtained usable public results during it, and uses only that subset to evaluate submissions and release the leaderboard after the cycle finish.'
    },
    {
      question: 'How is the leaderboard score calculated?',
      answer: 'CT Open evaluates submissions separately across three question categories: Endpoint, Superiority, and Comparative Effect. Endpoint questions ask whether a trial, or at least one study arm in a trial, meets a pre-specified endpoint. Superiority questions ask whether the treatment arm shows a statistically significant improvement over the comparator arm. Comparative Effect questions ask whether the treatment arm is statistically significantly better than, worse than, or not different from the comparator arm. For each category, CT Open compares a submission’s predictions with the official benchmark answers and computes that category’s F1 score and Balanced Accuracy. Here, Balanced Accuracy means the average of the model’s accuracy on the positive class and its accuracy on the negative class, so performance is measured more fairly when the class distribution is imbalanced. The leaderboard then reports these category-level scores to show performance across the different types of prediction tasks. The paper’s evaluation table also reports results separately for Endpoint, Superiority, and Comparative Effect, using Macro-F1 and an accuracy-based metric for each category.'
    },
    {
      question: 'What is the submission format?',
      answer: 'Your submission must be a UTF-8 encoded JSON file, and the top level of the file must be a dictionary. In that dictionary, each key should be a valid question ID from the benchmark. The value for each question should be a list of answer choices. This list is used when your model provides multiple predictions for the same question. Each item in the list represents the model’s choice for one prediction. For example, if the value is ["a", "b", "a"], that means the model chose a for the first prediction, b for the second, and a for the third. Because of this, all question lists must have the same length, so every question has the same number of predictions. Your file must include every required question ID in the benchmark, and the total number of submitted questions must match the benchmark exactly. Each answer list must contain at least one option. For most questions, the allowed options are a and b. Sometimes, a question may allow a, b, and c. Uppercase and lowercase letters are both accepted. Submissions are only accepted when the benchmark is open. You must also be logged in and have a verified email address before you can submit. The uploaded file must be 5 MB or smaller. You may upload a file more than once, but only your latest uploaded submission for that benchmark will count on the leaderboard. Any older uploaded submissions will remain in the system and be marked as discarded.'
    },
    {
      question: 'When will the leaderboard be released?',
      answer: 'Each CT Open benchmark cycle covers a three-month window. After that window ends, CT Open evaluates eligible submissions and releases the leaderboard in the first week after the cycle closes. For example, the leaderboard is released in the first week of March for Winter Open, June for Spring Open, September for Summer Open, and December for Fall Open.'
    },
    {
      question: 'Can I submit multiple times?',
      answer: 'Yes. You may upload more than one submission for the same benchmark, but only your latest submission will count on the leaderboard. When a new submission is accepted, the previous one for that benchmark will be discard and replaced by the new submission.'
    }
  ]
}
