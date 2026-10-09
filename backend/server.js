const express = require("express");
const path = require("path");
const crypto = require("crypto");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const db = require("./config/db");
const app = express();
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// CORS CONFIGURATION
// --------------------------------------------------

const allowedOrigins = [
  "https://construction-mocha.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// ADMIN SESSION HELPERS
// --------------------------------------------------

const COOKIE_NAME = "admin_session";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must contain at least 32 characters."
    );
  }

  return secret;
}

function safeEqual(a, b) {
  const first = Buffer.from(String(a));
  const second = Buffer.from(String(b));

  return (
    first.length === second.length &&
    crypto.timingSafeEqual(first, second)
  );
}

function signSession(payload) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");
}

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  return cookie
    ? decodeURIComponent(cookie.slice(name.length + 1))
    : null;
}

function createSession(username) {
  const expiresAt = Date.now() + SESSION_DURATION;
  const payload = `${username}|${expiresAt}`;

  return `${Buffer.from(payload).toString("base64url")}.${signSession(
    payload
  )}`;
}

function verifySession(req) {
  try {
    const token = getCookie(req, COOKIE_NAME);
    if (!token) return false;

    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [encodedPayload, receivedSignature] = parts;
    const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const expectedSignature = signSession(payload);

    if (!safeEqual(receivedSignature, expectedSignature)) return false;

    const separator = payload.lastIndexOf("|");
    if (separator === -1) return false;

    const username = payload.slice(0, separator);
    const expiresAt = Number(payload.slice(separator + 1));

    return (
      username === process.env.ADMIN_USERNAME &&
      Number.isFinite(expiresAt) &&
      Date.now() < expiresAt
    );
  } catch (error) {
    console.error("Session verification error:", error.message);
    return false;
  }
}

function setAdminCookie(res, token) {
  const production = process.env.NODE_ENV === "production";
  const sameSite = production ? "None; Secure" : "Lax";

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${
      SESSION_DURATION / 1000
    }; SameSite=${sameSite}`
  );
}

function clearAdminCookie(res) {
  const production = process.env.NODE_ENV === "production";
  const sameSite = production ? "None; Secure" : "Lax";

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=${sameSite}`
  );
}

function requireAdmin(req, res, next) {
  if (!verifySession(req)) {
    return res.status(401).json({
      success: false,
      message: "Please log in as admin.",
    });
  }

  next();
}

// --------------------------------------------------
// ADMIN LOGIN, SESSION AND LOGOUT
// --------------------------------------------------

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    return res.status(500).json({
      success: false,
      message: "Admin credentials are not configured.",
    });
  }

  if (
    !safeEqual(username || "", process.env.ADMIN_USERNAME) ||
    !safeEqual(password || "", process.env.ADMIN_PASSWORD)
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password.",
    });
  }

  try {
    setAdminCookie(res, createSession(process.env.ADMIN_USERNAME));

    return res.json({
      success: true,
      message: "Admin login successful.",
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not create admin session.",
    });
  }
});

app.get("/api/admin/session", (req, res) => {
  if (!verifySession(req)) {
    return res.status(401).json({
      authenticated: false,
      message: "Not logged in.",
    });
  }

  return res.json({ authenticated: true });
});

app.post("/api/admin/logout", (req, res) => {
  clearAdminCookie(res);

  return res.json({
    success: true,
    message: "Logged out successfully.",
  });
});

// --------------------------------------------------
// ADMIN DASHBOARD APIs
// --------------------------------------------------

app.get("/api/admin/summary", requireAdmin, (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM contact) AS totalContacts,
      (SELECT COUNT(*) FROM feedback) AS totalFeedback,
      (SELECT COALESCE(AVG(rating), 0) FROM feedback) AS averageRating
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Summary query error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not load dashboard summary.",
      });
    }

    return res.json({
      success: true,
      summary: results[0],
    });
  });
});

app.get("/api/admin/contacts", requireAdmin, (req, res) => {
  db.query("SELECT * FROM contact ORDER BY id DESC", (error, results) => {
    if (error) {
      console.error("Contacts query error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not load contacts.",
      });
    }

    return res.json({
      success: true,
      contacts: results,
    });
  });
});

app.get("/api/admin/feedback", requireAdmin, (req, res) => {
  db.query("SELECT * FROM feedback ORDER BY id DESC", (error, results) => {
    if (error) {
      console.error("Feedback query error:", error);

      return res.status(500).json({
        success: false,
        message: "Could not load feedback.",
      });
    }

    return res.json({
      success: true,
      feedback: results,
    });
  });
});

// --------------------------------------------------
// CONTACT FORM
// --------------------------------------------------

app.post("/api/contact", (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and message are required.",
    });
  }

  const sql = `
    INSERT INTO contact (name, email, phone, service, message)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      String(name).trim(),
      String(email).trim(),
      phone || "",
      service || "",
      String(message).trim(),
    ],
    (error, result) => {
      if (error) {
        console.error("Contact insert error:", error);

        return res.status(500).json({
          success: false,
          message: "Could not save contact submission.",
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

// --------------------------------------------------
// FEEDBACK FORM
// --------------------------------------------------

app.post("/api/feedback", (req, res) => {
  const { name, email, rating, message } = req.body;
  const numericRating = Number(rating);

  if (
    !name ||
    !email ||
    !message ||
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter your name, email, message, and a rating from 1 to 5.",
    });
  }

  const sql = `
    INSERT INTO feedback (name, email, rating, message)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      String(name).trim(),
      String(email).trim(),
      numericRating,
      String(message).trim(),
    ],
    (error, result) => {
      if (error) {
        console.error("Feedback insert error:", error);

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

// --------------------------------------------------
// BACKEND TEST
// --------------------------------------------------

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working!",
  });
});

// API requests that do not match a route return JSON
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

// --------------------------------------------------
// SERVE REACT BUILD WHEN AVAILABLE
// --------------------------------------------------

const buildPath = path.join(__dirname, "..", "build");

app.use(express.static(buildPath));

// Express 5 compatible wildcard route.
// Do not change this to app.get("*", ...).
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"), (error) => {
    if (error) {
      console.error("Could not serve frontend:", error.message);

      if (!res.headersSent) {
        res.status(404).send("Frontend build not found.");
      }
    }
  });
});

// --------------------------------------------------
// START SERVER ON RAILWAY
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
