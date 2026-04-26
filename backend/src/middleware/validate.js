const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Password length
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  next();
};

const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and password required'
    });
  }

  if (name.length < 2 || name.length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Name must be 2-50 characters'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  next();
};

const validateMessage = (req, res, next) => {
  const { message, agentType } = req.body;

  if (!message || !agentType) {
    return res.status(400).json({
      success: false,
      message: 'Message and agent type required'
    });
  }

  // Prevent very long messages
  if (message.length > 5000) {
    return res.status(400).json({
      success: false,
      message: 'Message too long (max 5000 characters)'
    });
  }

  const validAgents = ['teacher', 'examiner', 'debugger', 'coach', 'research', 'mentor'];
  if (!validAgents.includes(agentType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid agent type'
    });
  }

  next();
};

module.exports = { validateLogin, validateSignup, validateMessage };