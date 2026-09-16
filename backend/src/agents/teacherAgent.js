const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const teachTopic = async (topic, subject, branch, semester, learningStyle) => {
  const stylePrompt = {
    'visual': 'Use diagrams explained in text, flowcharts described in words, and visual analogies.',
    'theory': 'Start with theory and concepts first, then give examples.',
    'code': 'Start directly with code examples, then explain what the code does.',
    'fast': 'Give a quick 5-point summary only. Be very concise.'
  };

  const style = stylePrompt[learningStyle] || stylePrompt['theory'];

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    max_tokens: 2000,
    messages: [
      {
        role: 'system',
        content: `You are an expert teacher for ${branch} students, Semester ${semester}.
Your teaching style: ${style}
Always explain in simple English that a student can understand easily.
Make your explanation engaging and interesting.
Always end with a "Quick Summary" section.`
      },
      {
        role: 'user',
        content: `Teach me this topic from my syllabus:

Subject: ${subject}
Topic: ${topic}

Please cover:
1. What is it? (Simple definition)
2. Why is it important?
3. How does it work? (Step by step)
4. Real world example
5. Code example (if applicable)
6. Quick Summary (3 bullet points)

Make it feel like a real teacher is explaining to me personally.`
      }
    ]
  });

  return response.choices[0].message.content;
};

module.exports = { teachTopic };
