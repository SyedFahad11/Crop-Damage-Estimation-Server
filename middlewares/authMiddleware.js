const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }
  console.log(token)
  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    console.log("decoded ",decoded)
    req.user = decoded; // Add the user information to the request object
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
}

module.exports = authMiddleware;
