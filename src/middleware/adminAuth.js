function adminAuth(req, res, next) {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) return res.status(403).json({ error: 'Admin API key not configured' });

  const headerKey = (req.get('x-admin-key') || '').trim();
  const auth = req.get('authorization') || '';
  let bearer = '';
  if (auth.toLowerCase().startsWith('bearer ')) bearer = auth.slice(7).trim();

  if (headerKey === apiKey || bearer === apiKey) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = adminAuth;
