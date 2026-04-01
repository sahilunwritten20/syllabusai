const { searchWeb } = require('../tools/webSearch');
const { executeCode } = require('../tools/codeExecutor');

const webSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    const result = await searchWeb(query);

    return res.status(200).json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Web Search Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};

const runCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }

    const result = await executeCode(code, language);

    return res.status(200).json({
      success: true,
      output: result.output,
      executed: result.success
    });

  } catch (error) {
    console.error('Code Execution Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Execution failed'
    });
  }
};

module.exports = { webSearch, runCode };