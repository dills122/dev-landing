const puppeteer = require("puppeteer");

module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run preview:ci",
      startServerReadyPattern: "Local",
      startServerReadyTimeout: 30000,
      chromePath: process.env.CHROME_PATH || puppeteer.executablePath(),
      url: [
        "http://127.0.0.1:4321/",
        "http://127.0.0.1:4321/blog/",
        "http://127.0.0.1:4321/blog/angularjs-1x-horrors/",
      ],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--no-sandbox",
      },
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:performance": ["warn", { minScore: 0.75 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./.lighthouseci",
    },
  },
};
