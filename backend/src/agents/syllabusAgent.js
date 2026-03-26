const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const analyzeSyllabus = async (syllabusText) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4000,
    messages: [
      {
        role: 'system',
        content: 'You are an expert academic syllabus analyzer. Always respond with valid JSON only. No markdown, no backticks, no explanation.'
      },
      {
        role: 'user',
        content: `Analyze this syllabus and return ONLY a JSON object:
{
  "branch": "branch name",
  "semester": number,
  "subjects": [
    {
      "name": "subject name",
      "code": "subject code or empty string",
      "units": [
        {
          "unitNumber": 1,
          "title": "unit title",
          "topics": ["topic1", "topic2", "topic3"]
        }
      ]
    }
  ],
  "totalTopics": number,
  "estimatedHours": number
}

SYLLABUS TEXT:
${syllabusText}`
      }
    ]
  });

  const text = response.choices[0].message.content.trim();

  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleaned);
};

module.exports = { analyzeSyllabus };