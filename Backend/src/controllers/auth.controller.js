import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";

// Sets the JWT as an httpOnly cookie. Not readable by JS — protects against
// XSS token theft. sameSite "none" + secure is required for cross-site
// requests (e.g. Vercel frontend -> Render backend) in production.
const sendAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days — keep in sync with JWT_EXPIRE
  });
};

// POST /api/auth/register
// Public. Always creates a "user" role UNLESS the caller knows the
// server-side admin key — this is the "dedicated registration flag"
// mentioned in the spec. There is no separate public admin sign-up route.
export const register = async (req, res) => {
  const { name, email, password, adminSecret } = req.body;
  const errors = [];

  if (!name || !name.trim()) errors.push("Name is required");
  if (!email || !email.trim()) errors.push("Email is required");
  if (!password || password.length < 8)
    errors.push("Password must be at least 8 characters");

  if (errors.length > 0) {
    return res
      .status(400)
      .json({ success: false, message: "Validation failed", errors });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
        errors: [],
      });
    }

    const role =
      process.env.ADMIN_REGISTRATION_KEY &&
      adminSecret === process.env.ADMIN_REGISTRATION_KEY
        ? "admin"
        : "user";

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id, user.role);
    sendAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        // token is intentionally NOT included here — it lives only in the
        // httpOnly cookie now, so client-side JS never sees it.
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering",
      errors: [err.message],
    });
  }
};

// POST /api/auth/login
// Public.
export const login = async (req, res) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  if (errors.length > 0) {
    return res
      .status(400)
      .json({ success: false, message: "Validation failed", errors });
  }

  try {
    // password has select:false on the schema — request it explicitly here
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        errors: [],
      });
    }

    const token = generateToken(user._id, user.role);
    sendAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
      errors: [err.message],
    });
  }
};

// POST /api/auth/logout
// Clears the auth cookie. Public — safe to call even with an expired token.
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(0),
  });

  return res.status(200).json({
    success: true,
    data: { message: "Logged out successfully" },
  });
};

// GET /api/auth/me
// Auth required. Returns the currently logged-in user's profile.
export const getMe = async (req, res) => {
  // req.user is attached by the protect middleware
  return res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatarColor: req.user.avatarColor,
      createdAt: req.user.createdAt,
    },
  });
};

// GET /api/users
// Admin only — lists all registered users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role createdAt");

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching users",
      errors: [err.message],
    });
  }
};

// GET /api/users/:id
// Admin only — get a single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name email role createdAt",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the user",
      errors: [err.message],
    });
  }
};

// DELETE /api/users/:id
// Shared route: an Admin can delete ANY user, a regular User can only
// delete their OWN account. Authorization is checked here rather than in
// middleware since the rule depends on comparing req.user to req.params.id.
export const deleteUser = async (req, res) => {
  const targetId = req.params.id;
  const isAdmin = req.user.role === "admin";
  const isSelf = req.user._id.toString() === targetId;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own account",
      errors: [],
    });
  }

  try {
    const user = await User.findById(targetId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: [],
      });
    }

    await user.deleteOne();

    // If a user deleted their own account, clear their auth cookie too —
    // otherwise they'd still be holding a "valid" token for a user that
    // no longer exists, which would just bounce off `protect` later anyway.
    if (isSelf) {
      res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        expires: new Date(0),
      });
    }

    return res.status(200).json({
      success: true,
      data: { message: "User deleted successfully" },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the user",
      errors: [err.message],
    });
  }
};

// controllers/authController.js

export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatarColor } = req.body;

    // Build update object — only include fields that were actually sent
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (avatarColor !== undefined) updateFields.avatarColor = avatarColor;

    // Nothing to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update.",
      });
    }

    // Check email conflict only if email is being changed
    if (email) {
      const existing = await User.findOne({
        email,
        _id: { $ne: req.user._id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use by another account.",
        });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields }, // ← use $set explicitly
      { new: true, runValidators: true },
    ).select("-password");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ─────────────────────────────────────────────────────────

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    // Fetch user with password
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
