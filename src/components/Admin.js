
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Railway's reverse proxy for secure session cookies.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Allowed frontend origins.
const allowedOrigins = [
  "https://construction-mocha.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ""));
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header, such as server health checks.
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin session configuration.
app.use(
  session({
    name: "admin_session",
    secret:
      process.env.ADMIN_SESSION_SECRET ||
      "development-only-change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Health check.
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Construction backend is running",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
  });
});

// Submit a contact enquiry.
app.post("/api/contact", (req, res) => {
  const {
    name,
    email,
    phone,
    message,
  } = req.body;

  const projectType =
    req.body.projectType || req.body.project_type || "";

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email and message are required.",
    });
  }

  const sql = `
    INSERT INTO contacts
      (name, email, phone, project_type, message)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, email, phone || "", projectType, message],
    (error, result) => {
      if (error) {
        console.error("Contact insert error:", error.message);

        return res.status(500).json({
          success: false,
          message: "Could not save your enquiry.",
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

// Submit client feedback.
app.post("/api/feedback", (req, res) => {
  const { name, rating } = req.body;

  const feedbackText =
    req.body.feedback || req.body.message || "";

  const projectType =
    req.body.projectType || req.body.project_type || "";

  const numericRating = Number(rating);

  if (
    !name ||
    !feedbackText ||
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide your name, feedback and a rating from 1 to 5.",
    });
  }

  const sql = `
    INSERT INTO feedback
      (name, rating, feedback, project_type)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, numericRating, feedbackText, projectType],
    (error, result) => {
      if (error) {
        console.error("Feedback insert error:", error.message);

        return res.status(500).json({
          success: false,
          message: "Could not save feedback.",
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

// Admin login.
app.post("/api/admin/login", (req, res) => {
  const configuredUsername = process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredUsername || !configuredPassword) {
    console.error("Admin login environment variables are missing.");

    return res.status(500).json({
      success: false,
      message: "Admin login is not configured on the server.",
    });
  }

  const username =
    typeof req.body.username === "string"
      ? req.body.username.trim()
      : "";

  const password =
    typeof req.body.password === "string"
      ? req.body.password
      : "";

  if (
    username !== configuredUsername.trim() ||
    password !== configuredPassword
  ) {
    return res.status(401).json({
      success: false,
      message: "Incorrect username or password.",
    });
  }

  // Regenerate the session after successful authentication.
  req.session.regenerate((error) => {
    if (error) {
      console.error("Admin session error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Could not create an admin session.",
      });
    }

    req.session.admin = {
      username: configuredUsername.trim(),
    };

    req.session.save((saveError) => {
      if (saveError) {
        console.error("Admin session save error:", saveError.message);

        return res.status(500).json({
          success: false,
          message: "Could not save the admin session.",
        });
      }

      return res.json({
        success: true,
        message: "Login successful.",
        admin: {
          username: configuredUsername.trim(),
        },
      });
    });
  });
});

// Check the current admin session.
app.get("/api/admin/session", (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({
      success: false,
      message: "Not logged in.",
    });
  }

  return res.json({
    success: true,
    admin: req.session.admin,
  });
});

// Protect admin-only API routes.
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({
      success: false,
      message: "Please log in as admin.",
    });
  }

  next();
}

// Admin dashboard summary.
app.get("/api/admin/summary", requireAdmin, (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM contacts) AS totalContacts,
      (SELECT COUNT(*) FROM feedback) AS totalFeedback,
      (SELECT COALESCE(AVG(rating), 0) FROM feedback) AS averageRating
  `;

  db.query(sql, (error, rows) => {
    if (error) {
      console.error("Dashboard summary error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to load dashboard summary.",
      });
    }

    const row = rows[0] || {};

    return res.json({
      success: true,
      summary: {
        totalContacts: Number(row.totalContacts || 0),
        totalFeedback: Number(row.totalFeedback || 0),
        averageRating: Number(row.averageRating || 0),
      },
    });
  });
});

// Get all project enquiries.
app.get("/api/admin/contacts", requireAdmin, (req, res) => {
  const sql = "SELECT * FROM contacts ORDER BY id DESC";

  db.query(sql, (error, rows) => {
    if (error) {
      console.error("Load contacts error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to load enquiries.",
      });
    }

    return res.json({
      success: true,
      contacts: rows,
    });
  });
});

// Get all client feedback.
app.get("/api/admin/feedback", requireAdmin, (req, res) => {
  const sql = "SELECT * FROM feedback ORDER BY id DESC";

  db.query(sql, (error, rows) => {
    if (error) {
      console.error("Load feedback error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to load feedback.",
      });
    }

    return res.json({
      success: true,
      feedback: rows,
    });
  });
});

// Admin logout.
app.post("/api/admin/logout", (req, res) => {
  if (!req.session) {
    return res.json({
      success: true,
      message: "Logged out successfully.",
    });
  }

  req.session.destroy((error) => {
    if (error) {
      console.error("Admin logout error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Could not log out.",
      });
    }

    res.clearCookie("admin_session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({
      success: true,
      message: "Logged out successfully.",
    });
  });
});

// Return JSON for unknown API routes.
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

// Optional: serve a React production build if one exists.
const buildPath = path.join(__dirname, "..", "build");

app.use(express.static(buildPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(path.join(buildPath, "index.html"), (error) => {
    if (error) {
      return res.status(404).send(
        "Backend is running. The React build was not found."
      );
    }
  });
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
