# Deployment

This site is a static Astro build deployed to GitHub Pages with GitHub Actions.

## Workflows

Two workflows are configured, copied from the same pattern used in `corp-marketing`:

- `.github/workflows/ci.yml` builds the site on pull requests and manual runs.
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

This project is currently configured for a GitHub Pages project site:

```js
site: "https://dills122.github.io",
base: "dev-landing",
```

That should publish at:

```text
https://dills122.github.io/dev-landing/
```

If the repository name changes, update `base` in `astro.config.mjs`.

If you switch to a custom domain, update `astro.config.mjs` to use the full custom site URL and remove the `base` setting:

```js
site: "https://example.com",
```

Then add the custom domain to:

```text
public/CNAME
```
