import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

// Verifies the JWT stored in the httpOnly "token" cookie and attaches
// the user to req.user. Requires cookie-parser middleware in server.js.
export const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
      errors: [],
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists",
        errors: [],
      });
    }

    req.user = user; // available in every controller after this middleware
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed or expired",
      errors: [],
    });
  }
};

// Restricts a route to admins only. Always use AFTER protect.
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied — admin only",
      errors: [],
    });
  }
  next();
};
