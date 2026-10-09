
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const cors = require("cors");

// Load environment variables from backend/.env
require("dotenv").config({
  path: path.join(__dirname, ".env")
});

const db = require("./config/db");

const app = express();

const PORT = process.env.PORT || 5000;
const ADMIN_COOKIE = "admin_session";
const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// ADMIN HELPERS
// ===============================

function safeCompare(left, right) {
  const leftHash = crypto
    .createHash("sha256")
    .update(String(left))
    .digest();

  const rightHash = crypto
    .createHash("sha256")
    .update(String(right))
    .digest();

  return crypto.timingSafeEqual(leftHash, rightHash);
}

function sessionSignature(payload) {
  return crypto
    .createHmac(
      "sha256",
      process.env.ADMIN_SESSION_SECRET
    )
    .update(payload)
    .digest("hex");
}

function hasAdminConfiguration() {
  return Boolean(
    process.env.ADMIN_USERNAME &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_SESSION_SECRET &&
    process.env.ADMIN_SESSION_SECRET.length >= 32
  );
}

function isAdminAuthenticated(req) {
  if (!hasAdminConfiguration()) {
    return false;
  }

  const cookieHeader = req.headers.cookie || "";

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) =>
      part.startsWith(`${ADMIN_COOKIE}=`)
    );

  if (!cookie) {
    return false;
  }

  const token = cookie.slice(ADMIN_COOKIE.length + 1);
  const separator = token.lastIndexOf(".");

  if (separator < 0) {
    return false;
  }

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  if (
    !/^\d+$/.test(payload) ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return false;
  }

  if (
    Number(payload) <=
    Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  return safeCompare(
    signature,
    sessionSignature(payload)
  );
}

function requireAdmin(req, res, next) {
  if (!hasAdminConfiguration()) {
    return res.status(503).json({
      message: "Admin access is not configured."
    });
  }

  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({
      message: "Please sign in to access admin records."
    });
  }

  next();
}

function setAdminCookie(res, value, maxAge) {
  const secure =
    process.env.NODE_ENV === "production"
      ? "; Secure"
      : "";

  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${value}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${maxAge}${secure}`
  );
}

// ===============================
// ADMIN LOGIN
// ===============================

app.post("/api/admin/login", (req, res) => {
  if (!hasAdminConfiguration()) {
    return res.status(503).json({
      message: "Admin access is not configured."
    });
  }

  const { username, password } = req.body || {};

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !safeCompare(username, process.env.ADMIN_USERNAME) ||
    !safeCompare(password, process.env.ADMIN_PASSWORD)
  ) {
    return res.status(401).json({
      message: "Incorrect username or password."
    });
  }

  const payload = String(
    Math.floor(Date.now() / 1000) +
      ADMIN_SESSION_SECONDS
  );

  const token = `${payload}.${sessionSignature(payload)}`;

  setAdminCookie(res, token, ADMIN_SESSION_SECONDS);

  res.json({
    authenticated: true
  });
});

// ===============================
// ADMIN SESSION
// ===============================

app.get(
  "/api/admin/session",
  requireAdmin,
  (req, res) => {
    res.json({
      authenticated: true
    });
  }
);

// ===============================
// ADMIN LOGOUT
// ===============================

app.post("/api/admin/logout", (req, res) => {
  setAdminCookie(res, "", 0);

  res.json({
    authenticated: false
  });
});

// ===============================
// ADMIN SUMMARY
// ===============================

app.get(
  "/api/admin/summary",
  requireAdmin,
  (req, res) => {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM contact) AS enquiries,
        (SELECT COUNT(*) FROM feedback) AS feedback,
        (SELECT AVG(rating) FROM feedback) AS averageRating
    `;

    db.query(sql, (err, rows) => {
      if (err) {
        console.error(
          "Admin summary query failed:",
          err.message
        );

        return res.status(500).json({
          message: "Failed to load dashboard summary."
        });
      }

      const summary = rows[0];

      res.json({
        summary: {
          enquiries: Number(summary.enquiries),
          feedback: Number(summary.feedback),
          averageRating:
            summary.averageRating === null
              ? 0
              : Number(summary.averageRating)
        }
      });
    });
  }
);

// ===============================
// ADMIN CONTACTS
// ===============================

app.get(
  "/api/admin/contacts",
  requireAdmin,
  (req, res) => {
    const sql = `
      SELECT
        id,
        name,
        email,
        phone,
        project_type,
        message
      FROM contact
      ORDER BY id DESC
    `;

    db.query(sql, (err, records) => {
      if (err) {
        console.error(
          "Admin contact query failed:",
          err.message
        );

        return res.status(500).json({
          message: "Failed to load enquiries."
        });
      }

      res.json({
        records
      });
    });
  }
);

// ===============================
// ADMIN FEEDBACK
// ===============================

app.get(
  "/api/admin/feedback",
  requireAdmin,
  (req, res) => {
    const sql = `
      SELECT
        id,
        name,
        project_type,
        rating,
        feedback
      FROM feedback
      ORDER BY id DESC
    `;

    db.query(sql, (err, records) => {
      if (err) {
        console.error(
          "Admin feedback query failed:",
          err.message
        );

        return res.status(500).json({
          message: "Failed to load feedback."
        });
      }

      res.json({
        records
      });
    });
  }
);

// ===============================
// CONTACT API
// ===============================

app.post("/api/contact", (req, res) => {
  const {
    name,
    email,
    phone,
    projectType,
    message
  } = req.body || {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof projectType !== "string" ||
    !projectType.trim() ||
    typeof message !== "string" ||
    !message.trim()
  ) {
    return res.status(400).json({
      message: "Please fill all required fields."
    });
  }

  const sql = `
    INSERT INTO contact
      (name, email, phone, project_type, message)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    name.trim(),
    email.trim(),
    typeof phone === "string" ? phone.trim() : "",
    projectType.trim(),
    message.trim()
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(
        "CONTACT MYSQL ERROR:",
        err.message
      );

      return res.status(500).json({
        message: "Failed to save contact."
      });
    }

    console.log(
      "Contact saved successfully. ID:",
      result.insertId
    );

    res.status(201).json({
      message: "Contact submitted successfully!",
      id: result.insertId
    });
  });
});

// ===============================
// FEEDBACK API
// Saves name, project type, rating and feedback
// ===============================

app.post("/api/feedback", (req, res) => {
  const {
    name,
    projectType,
    rating,
    feedback
  } = req.body || {};

  const numericRating = Number(rating);

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 100
  ) {
    return res.status(400).json({
      message: "Please enter a valid name."
    });
  }

  if (
    typeof projectType !== "string" ||
    !projectType.trim() ||
    projectType.trim().length > 100
  ) {
    return res.status(400).json({
      message: "Please select a project type."
    });
  }

  if (
    rating === undefined ||
    rating === null ||
    rating === "" ||
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return res.status(400).json({
      message: "Rating must be between 1 and 5."
    });
  }

  if (
    typeof feedback !== "string" ||
    !feedback.trim()
  ) {
    return res.status(400).json({
      message: "Please enter your feedback."
    });
  }

  const sql = `
    INSERT INTO feedback
      (name, project_type, rating, feedback)
    VALUES (?, ?, ?, ?)
  `;

  const values = [
    name.trim(),
    projectType.trim(),
    numericRating,
    feedback.trim()
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(
        "MySQL Feedback Error:",
        err.message
      );

      return res.status(500).json({
        message: "Failed to save feedback."
      });
    }

    console.log(
      "Feedback saved successfully. ID:",
      result.insertId
    );

    res.status(201).json({
      message: "Feedback submitted successfully!",
      id: result.insertId
    });
  });
});

// ===============================
// TEST API
// ===============================

app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working!"
  });
});

// ===============================
// SERVE REACT BUILD
// ===============================

const buildPath = path.join(
  __dirname,
  "..",
  "build"
);

app.use(express.static(buildPath));

// ===============================
// REACT ROUTES
// ===============================

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      message: "API route not found"
    });
  }

  if (req.method === "GET") {
    return res.sendFile(
      path.join(buildPath, "index.html"),
      (err) => {
        if (err && !res.headersSent) {
          next(err);
        }
      }
    );
  }

  next();
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
