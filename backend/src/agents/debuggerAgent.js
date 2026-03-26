const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const debugCode = async (code, language, error, branch) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2000,
    messages: [
      {
        role: 'system',
        content: `You are an expert ${language} debugger and teacher for ${branch} students. 
Explain errors in simple language students can understand.
Always provide the fixed code.`
      },
      {
        role: 'user',
        content: `Please debug this ${language} code:

CODE:
${code}

ERROR (if any):
${error || 'No error message, just review and improve the code'}

Please provide:
1. What is wrong (simple explanation)
2. Why it's wrong
3. Fixed code
4. What you learned from this mistake`
      }
    ]
  });

  return response.choices[0].message.content;
};

const reviewCode = async (code, language, topic, branch) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2000,
    messages: [
      {
        role: 'system',
        content: `You are a code reviewer for ${branch} students learning ${topic}.`
      },
      {
        role: 'user',
        content: `Review this ${language} code for topic "${topic}":

${code}

Provide:
1. Code Quality (1-10 score)
2. What's good about it
3. What can be improved
4. Optimized version
5. Best practices to follow`
      }
    ]
  });

  return response.choices[0].message.content;
};

module.exports = { debugCode, reviewCode };