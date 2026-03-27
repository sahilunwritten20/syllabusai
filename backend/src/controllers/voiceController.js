const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Speech to Text using Groq Whisper
const speechToText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file' });
    }

    const transcription = await groq.audio.transcriptions.create({
      file: req.file.buffer,
      model: 'whisper-large-v3',
      language: 'en'
    });

    res.status(200).json({
      success: true,
      text: transcription.text
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { speechToText };