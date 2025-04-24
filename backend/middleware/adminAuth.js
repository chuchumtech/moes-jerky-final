module.exports = function (req, res, next) {
  if (req.session && req.session.admin) {
    // Auto-logout after 5 min inactivity
    if (Date.now() - (req.session.lastActive || 0) > 5 * 60 * 1000) {
      req.session.destroy(() => res.status(401).json({ error: 'Session expired' }));
    } else {
      req.session.lastActive = Date.now();
      next();
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
