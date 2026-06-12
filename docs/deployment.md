# Deployment

This site is a static Astro build deployed to GitHub Pages with GitHub Actions.

## Workflows

Two workflows are configured:

- `.github/workflows/ci.yml` runs linting, builds the site, audits the sitemap with Pa11y CI, and runs Lighthouse CI on representative pages.
- `.github/workflows/deploy.yml` builds and deploys the site when `main` is pushed.

The deploy workflow uses Astro's official GitHub Pages path:

- `withastro/action@v6` builds and uploads the Astro site artifact.
- `actions/deploy-pages@v5` publishes the artifact to GitHub Pages.

## GitHub Pages Settings

In the GitHub repository:

1. Open `Settings` -> `Pages`.
2. Set `Build and deployment` -> `Source` to `GitHub Actions`.
3. Push to `main`, or run the `Deploy to GitHub Pages` workflow manually.

If deployment reaches `actions/deploy-pages` and fails with:

```text
Creating Pages deployment failed
HttpError: Not Found
Ensure GitHub Pages has been enabled
```

the build artifact uploaded correctly, but GitHub Pages has not been enabled for the repository yet. Complete the Pages settings above, then re-run the failed workflow.

## Astro URL Settings

This project is configured for the custom domain root:

```js
site: "https://dsteele.dev",
```

That should publish at:

```text
https://dsteele.dev/
```

Do not set `base` while publishing to the domain root. A `base` value would prefix generated assets and links with a subdirectory, which breaks CSS and JavaScript requests on the custom domain.

The custom domain is checked into:

```text
public/CNAME
```

If this ever moves back to a GitHub Pages project URL, restore a matching `base` value in `astro.config.mjs` and update the audit URLs in `package.json` and `lighthouserc.cjs`.
