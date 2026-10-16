# Let's Visit Korea traffic admin

Private dashboard at https://letsvisitkorea-admin.kdhfighter.workers.dev.
Uses existing Cloudflare Web Analytics; visits are sessions, not unique people.
No Cloudflare Access/Zero Trust subscription is needed.

GitHub Actions repository configuration:
- `CLOUDFLARE_API_TOKEN` secret: account-scoped Workers Scripts Edit and Account Analytics Read.
- `CLOUDFLARE_ACCOUNT_ID` secret: deployment account.
- `LVK_ADMIN_PASSWORD` secret: a unique, randomly generated password of at least 20 characters. Enter it directly in GitHub Secrets, never commit it.
- `LVK_ADMIN_EMAIL` variable: the only permitted login email.

Run the `Admin worker deploy` workflow after changing credentials. Password rotation invalidates existing sessions. Session cookies last eight hours and are Secure, HttpOnly, SameSite=Strict, and signed. Login requests must be same-origin and are rate-limited. Missing configuration blocks login. The rate limiter is per Cloudflare location, not a globally exact counter.

Run `node admin-worker/auth.test.mjs` for auth regression checks. Deployment verifies authenticated stats without printing traffic numbers or credentials.
