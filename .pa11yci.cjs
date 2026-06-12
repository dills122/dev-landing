const chromePath = process.env.CHROME_PATH;

module.exports = {
  defaults: {
    standard: "WCAG2AA",
    timeout: 30000,
    wait: 500,
    chromeLaunchConfig: {
      ...(chromePath ? { executablePath: chromePath } : {}),
      args: ["--no-sandbox"],
    },
  },
};
