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
        date: 'August 31',
        parts: [
          { type: 'text', value: 'Summer 2026 Open has closed submissions and is currently under evaluation.' }
        ]
      }
    ]
  },
  introduction: {
    title: 'About CT Open',
    sections: [
      {
        heading: 'Mission Statement',
        paragraphs: [
          '**Our mission is to advance clinical trial outcome prediction by building a fair, open, and live platform where different methods can be tested on whether they can forecast trial results before those results are publicly known.**',
          'CT Open is designed to measure genuine predictive ability rather than recall of known answers. By evaluating predictions against future clinical trial outcomes, CT Open aims to advance AI research, inform biomedical discovery, and help the community better understand what makes clinical trials succeed or fail.'
        ]
      },
      {
        heading: 'What Is CT Open?',
        paragraphs: [
          'CT Open is a **live, open-access platform for predicting clinical trial outcomes**, forecasting whether a trial will meet its goals before its results are ever published.',
          'Every year we run **four challenges**: Winter, Spring, Summer, and Fall. Each challenge gives participants a set of questions about real, ongoing clinical trials. Participants submit their predictions before the deadline. Over the following months, as those trials report their results, we check the predictions against what actually happened and publish a public leaderboard.'
        ]
      },
      {
        heading: 'Why A Live Benchmark?',
        paragraphs: [
          'Here is what makes CT Open different from a typical benchmark: **we only score participants on trials whose outcomes were not available anywhere on the internet when they submitted.**',
          'This means strong performance cannot come from simply looking up the answer. It has to come from real predictive skill.',
          'CT Open checks public sources, including registries, journals, news, press releases, conference materials, and financial disclosures, to determine whether a result had already been made public.'
        ]
      },
      {
        heading: 'Open To Every Method',
        paragraphs: [
          'Participants can get there however they like. **Any method, any data source is welcome**, including large language models, classical machine learning, agentic web search, expert judgment, or something nobody has tried yet.',
          'The challenge is open to everyone.'
        ]
      },
      {
        heading: 'Why It Matters',
        paragraphs: [
          'Clinical development is full of uncertainty. Many trials launch with high hopes and fail to meet their objectives. Accurate prediction of trial outcomes could help **clinicians, patients, and researchers** make better decisions and help **drug developers** design stronger trials.',
          'It is also an important test for AI. Today\'s models are remarkably good at tasks where the answer is already known somewhere. But can they make useful predictions about questions whose answers are not yet public? CT Open exists to study that question in a live setting and to reward systems that demonstrate genuine foresight.'
        ]
      },
      {
        heading: 'Explore The Challenge',
        paragraphs: [
          'The current benchmark panel above shows the active challenge, available files, submission status, and leaderboard information. For participants who are ready to submit, the Instructions page explains the submission format, deadlines, evaluation windows, contamination checks, and leaderboard process in detail.'
        ]
      }
    ],
    links: [
      { label: 'Code', href: '#' },
      { label: 'Report / PDF', href: '#' }
    ]
  },
  instructionsIntroduction: {
    title: 'About CT Open',
    sections: [
      {
        heading: 'From Benchmark To Participation',
        paragraphs: [
          'This page provides the practical details behind the CT Open challenge introduced on the benchmark page.',
          'The benchmark page explains what CT Open is and why it exists. This page explains how to participate, how submissions are handled, and how results are evaluated.'
        ]
      },
      {
        heading: 'How It Works',
        items: [
          '**1. Download the questions.** Each challenge releases a set of prediction questions about clinical trials likely to report results soon.',
          '**2. Submit before the deadline.** Make your predictions and upload them before the submission window closes. At submission time, the scored trial outcomes should not yet be publicly known.',
          '**3. We wait, then we verify.** As the evaluation window unfolds, trials report their outcomes. CT Open checks public sources to confirm which trial results became available only after the submission deadline.',
          '**4. The leaderboard goes live.** We evaluate submissions on the verified eligible set and publish the rankings after the results have been checked.'
        ]
      },
      {
        heading: 'Submission Window',
        paragraphs: [
          'Each challenge has a submission window. During this period, participants can upload prediction files for the current challenge.',
          'A valid submission must follow the required JSON format and must be uploaded before the deadline. Once the submission window closes, participants can no longer update answers for that challenge cycle.',
          'If a participant submits multiple valid files during the same challenge cycle, CT Open keeps the most recent valid submission for that cycle.'
        ]
      },
      {
        heading: 'Evaluation Window',
        paragraphs: [
          'The evaluation happens after submissions close. During the evaluation window, some trials in the benchmark may report results publicly.',
          'CT Open then checks which trial outcomes became available after the submission deadline and uses those eligible trials for scoring.',
          'Trials whose outcomes were already public before the deadline are excluded from evaluation, because they would not fairly test prediction.'
        ]
      },
      {
        heading: 'Contamination Checks',
        paragraphs: [
          'CT Open is designed to be contamination-resistant.',
          'The platform checks whether trial outcomes were already publicly available before the submission deadline. Public sources may include registries, journals, news, press releases, conference materials, financial disclosures, and other public records.',
          'If a result was public before submission, that trial is excluded from scoring.'
        ]
      },
      {
        heading: 'What You Will Predict',
        paragraphs: [
          'CT Open questions are defined at the level of a specific trial outcome measure and its study arms. There are three types:'
        ],
        items: [
          '**Superiority**: Did the treatment significantly outperform the comparator?',
          '**Comparative Effect**: Was the treatment significantly better, worse, or no different than the comparator?',
          '**Endpoint**: Did the trial, or at least one arm, meet its endpoint?'
        ]
      },
      {
        heading: 'Leaderboard Release',
        paragraphs: [
          'After the evaluation window ends and eligible outcomes have been verified, CT Open computes scores for valid submissions and publishes the leaderboard.',
          'The leaderboard reflects the most recent valid submission from each participant for that challenge cycle.'
        ]
      },
      {
        heading: 'Code And Resources',
        paragraphs: [
          'For code, dataset utilities, and benchmark resources, visit the CT Open GitHub repository:'
        ],
        items: [
          '[CT_Open GitHub Repository](https://github.com/ClinicalTrial-OpenChallenge/CT_Open/tree/main)'
        ]
      },
      {
        heading: 'Explore The Data',
        paragraphs: [
          'Get started before the next challenge with our open datasets:',
          'Spanning oncology, cardiovascular disease, autoimmune disorders, neurology, and many more, across 80+ countries.'
        ],
        table: {
          headers: ['', 'Trials', 'Questions'],
          rows: [
            ['**Training Set**', '7,292', '~15,444'],
            ['**Winter 2025 Benchmark**', '314', '605'],
            ['**Summer 2025 Benchmark**', '240', '857']
          ]
        },
        afterTableParagraphs: [
          'You can download these files from GitHub:'
        ],
        items: [
          '[train_data](https://github.com/ClinicalTrial-OpenChallenge/CT_Open/tree/main/datasets) (Since github not support the file that exceed 25MB, we divide it into 3 part, please merge them when you want to use it )',
          '[Winter_2025.pickle](https://github.com/ClinicalTrial-OpenChallenge/CT_Open/blob/main/datasets/Winter_2025.pickle)',
          '[Summer_2025.pickle](https://github.com/ClinicalTrial-OpenChallenge/CT_Open/blob/main/datasets/Summer_2025.pickle)'
        ]
      }
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
