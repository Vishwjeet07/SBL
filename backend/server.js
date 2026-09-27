const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "sbl_jwt_secret_key_2026_secure";

// In-memory fallback database for local/offline resilience
const localUsers = [];

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// MongoDB Connection
let isMongoConnected = false;
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    })
    .then(() => {
      isMongoConnected = true;
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      isMongoConnected = false;
      console.log("MongoDB connection failed, running in fallback mode:", error.message);
    });
}

// User Model import
let User;
try {
  User = require("./models/User");
} catch (e) {
  console.log("Using dynamic User model definition");
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No JWT token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired JWT token" });
    }
    req.user = user;
    next();
  });
}

// Routes

// 1. Root Status Route
app.get("/", (req, res) => {
  res.send(`
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
      <h1 style="color: #2c3e50;">Backend & JWT Authentication Server</h1>
      <p style="color: #27ae60; font-size: 18px; font-weight: bold;">Status: Running Successfully on Port 5000</p>
      <p>Endpoints: <code>/api/auth/register</code>, <code>/api/auth/login</code>, <code>/api/auth/profile</code>, <code>/api/auth/dashboard</code></p>
    </div>
  `);
});

// 2. Register Route
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    if (isMongoConnected && User) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
    } else {
      const existingLocal = localUsers.find(u => u.email === normalizedEmail);
      if (existingLocal) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;
    if (isMongoConnected && User) {
      const userDoc = new User({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: role || "Student"
      });
      newUser = await userDoc.save();
    } else {
      newUser = {
        _id: "local_" + Date.now(),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: role || "Student",
        createdAt: new Date()
      };
      localUsers.push(newUser);
    }

    // Generate JWT token
    const tokenPayload = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "24h" });

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
});

// 3. Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user;
    if (isMongoConnected && User) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = localUsers.find(u => u.email === normalizedEmail);
    }

    // For demonstration, if no user exists yet, allow demo login or require register
    if (!user) {
      // Create a default user if demo user signs in
      if (normalizedEmail === "demo@library.com" && password === "123456") {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = {
          _id: "demo_1",
          name: "Demo Member",
          email: "demo@library.com",
          password: hashedPassword,
          role: "Student"
        };
        localUsers.push(user);
      } else {
        return res.status(401).json({ message: "Invalid email or password. Please register first." });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Sign JWT Token
    const tokenPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "24h" });

    res.json({
      message: "Login successful",
      token,
      user: tokenPayload
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
});

// 4. Protected Profile Route (JWT verification)
app.get("/api/auth/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Profile retrieved successfully using valid JWT",
    user: req.user
  });
});

// 5. Protected Dashboard Route (JWT verification)
app.get("/api/auth/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: "Dashboard data authorized by JWT",
    user: req.user,
    stats: {
      totalBooks: 1450,
      availableBooks: 1180,
      issuedBooks: 2,
      activeMembers: 350,
      pendingFines: 0,
      membershipStatus: "Active",
      membershipExpiry: "2026-12-31"
    },
    recentActivities: [
      { id: 1, action: "Book Issued", title: "Artificial Intelligence: A Modern Approach", date: "2026-09-18" },
      { id: 2, action: "Book Returned", title: "Database System Concepts", date: "2026-09-10" },
      { id: 3, action: "Library Fee Paid", title: "Semester Membership", date: "2026-09-01", amount: "₹500" }
    ]
  });
});

// Optional Items routes mount
try {
  const itemRoutes = require("./routes/items");
  app.use("/api/items", itemRoutes);
} catch (e) {
  // item routes optional
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend & JWT Auth Server running at http://localhost:${PORT}`);
});