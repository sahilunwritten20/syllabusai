const Workspace = require('../models/Workspace');

const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workspace = await Workspace.create({
      name, description, owner: req.user.userId,
      members: [{ user: req.user.userId, role: 'admin' }]
    });
    res.status(201).json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      'members.user': req.user.userId
    }).populate('owner', 'name email');
    res.status(200).json({ success: true, workspaces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });
    workspace.members.push({ user: userId, role: 'member' });
    await workspace.save();
    res.status(200).json({ success: true, message: 'Member added!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createWorkspace, getMyWorkspaces, addMember };