const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const db = require("./config/db");

const PORT = process.env.PORT || 8080;

const CLIENT_URL =
  process.env.CLIENT_URL || "https://construction-mocha.vercel.app";

// CORS
app.use(
  cors({
    origin: [
      CLIENT_URL,
      "https://construction-mocha.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    name: "admin_session",
    secret:
      process.env.ADMIN_SESSION_SECRET ||
      "change-this-session-secret-before-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Home and health-check routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Construction backend is running!",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working!",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
  });
});

// CONTACT FORM
// Database columns: name, email, phone, project_type, message
app.post("/api/contact", (req, res) => {
  const { name, email, phone, message } = req.body;

  const projectType =
    req.body.project_type || req.body.projectType || "";

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and message are required.",
    });
  }

  const sql = `
    INSERT INTO contact
      (name, email, phone, project_type, message)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      String(name).trim(),
      String(email).trim(),
      phone ? String(phone).trim() : "",
      String(projectType).trim(),
      String(message).trim(),
    ],
    (err, result) => {
      if (err) {
        console.error("Contact insert error:", err);

        return res.status(500).json({
          success: false,
          message: "Could not save contact submission",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Contact submitted successfully!",
        id: result.insertId,
      });
    }
  );
});

// FEEDBACK FORM
app.post("/api/feedback", (req, res) => {
  const { name, rating, message } = req.body;

  if (
    !name ||
    rating === undefined ||
    rating === null ||
    !message
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, rating, and message are required.",
    });
  }

  const numericRating = Number(rating);

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return res.status(400).json({
      success: false,
      message: "Rating must be a number from 1 to 5.",
    });
  }

  const sql = `
    INSERT INTO feedback (name, rating, message)
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [String(name).trim(), numericRating, String(message).trim()],
    (err, result) => {
      if (err) {
        console.error("Feedback insert error:", err);

        return res.status(500).json({
          success: false,
          message: "Could not save feedback",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Feedback submitted successfully!",
        id: result.insertId,
      });
    }
  );
});

// ADMIN LOGIN
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (
    !process.env.ADMIN_USERNAME ||
    !process.env.ADMIN_PASSWORD ||
    !process.env.ADMIN_SESSION_SECRET
  ) {
    return res.status(500).json({
      success: false,
      message: "Admin credentials are not configured on the server.",
    });
  }

  const usernameMatches =
    typeof username === "string" &&
    username === process.env.ADMIN_USERNAME;

  const passwordMatches =
    typeof password === "string" &&
    password === process.env.ADMIN_PASSWORD;

  if (!usernameMatches || !passwordMatches) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password.",
    });
  }

  req.session.admin = {
    username: process.env.ADMIN_USERNAME,
  };

  req.session.save((err) => {
    if (err) {
      console.error("Admin session error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not create admin session.",
      });
    }

    return res.json({
      success: true,
      message: "Admin login successful!",
    });
  });
});

// CHECK ADMIN SESSION
app.get("/api/admin/session", (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: "Not logged in",
    });
  }

  return res.json({
    success: true,
    admin: req.session.admin,
  });
});

// ADMIN LOGOUT
app.post("/api/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Admin logout error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not log out.",
      });
    }

    res.clearCookie("admin_session");

    return res.json({
      success: true,
      message: "Logged out successfully.",
    });
  });
});

// Protect admin dashboard routes
function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: "Admin login required.",
    });
  }

  next();
}

// ADMIN DASHBOARD SUMMARY
app.get("/api/admin/summary", requireAdmin, (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM contact) AS totalContacts,
      (SELECT COUNT(*) FROM feedback) AS totalFeedback,
      (SELECT COALESCE(AVG(rating), 0) FROM feedback) AS averageRating
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Admin summary error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not load dashboard summary.",
      });
    }

    return res.json({
      success: true,
      summary: rows[0],
    });
  });
});

// ADMIN CONTACTS
app.get("/api/admin/contacts", requireAdmin, (req, res) => {
  db.query("SELECT * FROM contact ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.error("Admin contacts error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not load contacts.",
      });
    }

    return res.json({
      success: true,
      contacts: rows,
    });
  });
});

// ADMIN FEEDBACK
app.get("/api/admin/feedback", requireAdmin, (req, res) => {
  db.query("SELECT * FROM feedback ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.error("Admin feedback error:", err);

      return res.status(500).json({
        success: false,
        message: "Could not load feedback.",
      });
    }

    return res.json({
      success: true,
      feedback: rows,
    });
  });
});

// Serve React build if it exists
const buildPath = path.join(__dirname, "..", "build");

app.use(express.static(buildPath));

// Unknown API routes
app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

// React frontend fallback (Express 5)
app.get("/{*splat}", (req, res, next) => {
  res.sendFile(path.join(buildPath, "index.html"), (err) => {
    if (err) {
      next(err);
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

server.on("error", (err) => {
  console.error("Server startup error:", err);
  process.exit(1);
});
