const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // store token data
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};
