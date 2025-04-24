// Admin session inactivity middleware
// Ends session if more than 5 minutes (300,000 ms) of inactivity

module.exports = function adminSession(req, res, next) {
  if (req.session && req.session.admin) {
    const now = Date.now();
    const lastActive = req.session.lastActive || now;
    if (now - lastActive > 5 * 60 * 1000) { // 5 minutes
      req.session.destroy(() => {
        res.status(440).json({ error: 'Session expired due to inactivity' });
      });
      return;
    }
    req.session.lastActive = now;
  }
  next();
}
