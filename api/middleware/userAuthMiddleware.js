const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  console.log("Authenticating...")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If no token provided, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    // Verify the token and extract the username from the payload
    const decoded = jwt.verify(token, jwtSecret);

    // Get User Id
    const userId = decoded.id;

    // Add the user Id to the request object
    req.user = { id: userId };

    // Proceed to the protected APIs
    console.log(`User: ${req.user.id} - Authenticated`)
    next();
  } catch (err) {
    // If token is invalid, return 401 Unauthorized
    res.status(401).json({ message: 'Invalid authentication token' });
  }
}

module.exports = {authMiddleware};
