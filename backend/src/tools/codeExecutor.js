const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const executeCode = async (code, language) => {
  return new Promise((resolve) => {
    const tempDir = '/tmp';
    const extensions = { python: 'py', javascript: 'js', java: 'java' };
    const ext = extensions[language.toLowerCase()] || 'txt';
    const fileName = `code_${Date.now()}.${ext}`;
    const filePath = path.join(tempDir, fileName);

    fs.writeFileSync(filePath, code);

    const commands = {
      python: `python3 ${filePath}`,
      javascript: `node ${filePath}`,
    };

    const command = commands[language.toLowerCase()];
    if (!command) {
      resolve({ success: false, output: 'Language not supported' });
      return;
    }

    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      fs.unlinkSync(filePath);
      if (error) {
        resolve({ success: false, output: stderr || error.message });
      } else {
        resolve({ success: true, output: stdout });
      }
    });
  });
};

module.exports = { executeCode };