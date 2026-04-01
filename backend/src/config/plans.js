const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    duration: 0,
    features: {
      maxSyllabusUploads: 1,
      maxAIMessages: 50,
      voiceEnabled: false,
      allAgents: false
    }
  },
  pro: {
    name: 'Pro',
    price: 29900, // paise
    duration: 30,
    features: {
      maxSyllabusUploads: 10,
      maxAIMessages: 1000,
      voiceEnabled: true,
      allAgents: true
    }
  },
  college: {
    name: 'College',
    price: 999900,
    duration: 30,
    features: {
      maxSyllabusUploads: 999,
      maxAIMessages: 99999,
      voiceEnabled: true,
      allAgents: true
    }
  }
};

module.exports = PLANS;