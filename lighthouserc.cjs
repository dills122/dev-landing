const chromePath = process.env.CHROME_PATH;

module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run preview:ci",
      startServerReadyPattern: "Local",
      startServerReadyTimeout: 30000,
      ...(chromePath ? { chromePath } : {}),
      url: [
        "http://127.0.0.1:4322/",
        "http://127.0.0.1:4322/blog/",
        "http://127.0.0.1:4322/blog/angularjs-1x-horrors/",
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--no-sandbox",
      },
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:performance": [
          "error",
          { minScore: 0.8, aggregationMethod: "median" },
        ],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./.lighthouseci",
    },
  },
};
