const { spawn } = require("child_process");
const http = require("http");

const build = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

build.on("error", (error) => {
  console.error("Failed to start the React build:", error);
  process.exitCode = 1;
});

build.on("close", (code) => {
  if (code !== 0) {
    console.error(`React build failed with exit code ${code}.`);
    process.exitCode = code || 1;
    return;
  }

  startServer();
});

function startServer() {
  const server = spawn("node", ["backend/server.js"], {
    stdio: "inherit"
  });

  server.on("error", (error) => {
    console.error("Failed to start the backend server:", error);
    process.exitCode = 1;
  });

  const checkServer = () => {
    const req = http.get("http://localhost:5000", () => {
      console.log("Website is ready!");

      spawn(
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        ["http://localhost:5000"],
        {
          detached: true,
          stdio: "ignore"
        }
      ).unref();
    });

    req.on("error", () => {
      setTimeout(checkServer, 500);
    });
  };

  setTimeout(checkServer, 500);
}