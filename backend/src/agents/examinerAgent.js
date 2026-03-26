const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateQuiz = async (topic, subject, branch, difficulty = 'medium') => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2000,
    messages: [
      {
        role: 'system',
        content: 'You are an expert examiner. Always respond with valid JSON only. No markdown, no backticks.'
      },
      {
        role: 'user',
        content: `Create a quiz for ${branch} students on topic "${topic}" from subject "${subject}".
Difficulty: ${difficulty}

Return ONLY this JSON:
{
  "topic": "${topic}",
  "subject": "${subject}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "A",
      "explanation": "why this answer is correct"
    }
  ],
  "totalQuestions": 5,
  "timeLimit": 10
}`
      }
    ]
  });

  const text = response.choices[0].message.content.trim();
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};

const evaluateAnswer = async (question, userAnswer, correctAnswer, topic) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 500,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful examiner giving feedback on student answers.'
      },
      {
        role: 'user',
        content: `Question: ${question}
Student answered: ${userAnswer}
Correct answer: ${correctAnswer}
Topic: ${topic}

Give encouraging feedback in 2-3 sentences. If wrong, explain why the correct answer is right.`
      }
    ]
  });

  return response.choices[0].message.content;
};

module.exports = { generateQuiz, evaluateAnswer };