const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const researchTopic = async (topic, subject, branch, depth = 'medium') => {
  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    max_tokens: 2500,
    messages: [
      {
        role: 'system',
        content: `You are a research assistant for ${branch} students. 
Provide deep, accurate, well-structured information.`
      },
      {
        role: 'user',
        content: `Research this topic for a ${branch} student:

Topic: ${topic}
Subject: ${subject}
Depth: ${depth}

Provide:
1. Deep explanation
2. Historical background
3. Key concepts and terminology
4. Real world applications
5. Current industry usage
6. Related topics to explore
7. Top resources to learn more`
      }
    ]
  });

  return response.choices[0].message.content;
};

const answerDoubt = async (doubt, context, branch, semester) => {
  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    max_tokens: 1500,
    messages: [
      {
        role: 'system',
        content: `You are a helpful tutor for ${branch} Semester ${semester} students.
Answer doubts clearly and patiently.`
      },
      {
        role: 'user',
        content: `Student doubt: ${doubt}

Context: ${context || 'General question'}

Answer this doubt in a way that:
1. Directly answers the question
2. Gives a simple example
3. Connects to what they already know
4. Suggests what to study next`
      }
    ]
  });

  return response.choices[0].message.content;
};

module.exports = { researchTopic, answerDoubt };
