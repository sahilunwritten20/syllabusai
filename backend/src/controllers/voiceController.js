const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const speechToText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file uploaded' });
    }

    const tempPath = path.join('/tmp', `audio_${Date.now()}.webm`);
    fs.writeFileSync(tempPath, req.file.buffer);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: 'whisper-large-v3-turbo',
      language: 'en'
    });

    fs.unlinkSync(tempPath);

    res.status(200).json({
      success: true,
      text: transcription.text
    });

  } catch (error) {
    console.error('Voice error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { speechToText };