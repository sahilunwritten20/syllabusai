const ApiKey = require('../models/ApiKey');

// ✅ Create API Key
const createApiKey = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const apiKey = await ApiKey.create({
      userId: req.user.userId,
      name: name.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'API key created',
      apiKey
    });

  } catch (error) {
    console.error('Create API Key Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create API key'
    });
  }
};

// ✅ Get All API Keys
const getMyApiKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      keys
    });

  } catch (error) {
    console.error('Fetch API Keys Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch API keys'
    });
  }
};

// ✅ Delete API Key
const deleteApiKey = async (req, res) => {
  try {
    const deleted = await ApiKey.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'API key deleted successfully'
    });

  } catch (error) {
    console.error('Delete API Key Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete API key'
    });
  }
};

module.exports = {
  createApiKey,
  getMyApiKeys,
  deleteApiKey
};