const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getDailyPlan = async (syllabus, completedTopics, totalTopics, streak, examDate) => {
  const progress = Math.round((completedTopics / totalTopics) * 100);

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    max_tokens: 1500,
    messages: [
      {
        role: 'system',
        content: 'You are a motivating academic coach who creates personalized study plans.'
      },
      {
        role: 'user',
        content: `Create a daily study plan for this student:

Branch: ${syllabus.branch}
Semester: ${syllabus.semester}
Overall Progress: ${progress}%
Current Streak: ${streak} days
Topics Completed: ${completedTopics}/${totalTopics}
Exam Date: ${examDate || 'Not set'}

Pending subjects:
${syllabus.subjects.map(s => `- ${s.name}: ${s.progress}% complete`).join('\n')}

Create a motivating daily plan with:
1. Morning session (what to study)
2. Afternoon session (practice/coding)
3. Evening session (revision)
4. Motivational message
5. Today's goal`
      }
    ]
  });

  return response.choices[0].message.content;
};

const getMotivation = async (studentName, streak, progress, weakSubjects) => {
  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    max_tokens: 500,
    messages: [
      {
        role: 'system',
        content: 'You are an enthusiastic motivational coach for students.'
      },
      {
        role: 'user',
        content: `Give a short motivational message (4-5 sentences) for:
Student: ${studentName}
Current streak: ${streak} days
Overall progress: ${progress}%
Weak subjects: ${weakSubjects.join(', ')}

Be personal, encouraging and specific to their situation.`
      }
    ]
  });

  return response.choices[0].message.content;
};

module.exports = { getDailyPlan, getMotivation };
