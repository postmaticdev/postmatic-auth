<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Postmatic Auth Frontend Knowledge

### Stack and Core Rules
- Next.js `16.2.6` App Router.
- `params`, `searchParams`, and `cookies()` are async in this codebase style.
- Keep auth mutations in Server Actions under `src/action/*`.
- Use shadcn UI components for forms and cards.

### Route Contract
- `/login`: credentials login + Google OAuth entry point.
- `/register`: credential registration.
- `/verify-account/[token]`: validate verify-token and submit verification.
- `/forgot-password`: request reset link flow.
- `/forgot-password/[token]`: validate reset link and submit new password.
- `/invite-member/[token]`: validate business invitation token and submit invitation answer.
- `/` redirects to `/login`.

### Auth API Mapping (from `auth.json`)
- `POST /api/account/auth/login`
- `POST /api/account/auth/register`
- `GET /api/account/auth/verify/:token`
- `POST /api/account/auth/verify/:token?from=...`
- `POST /api/account/auth/resend-email-verification`
- `GET /api/account/google-oauth/login?from=...`
- `GET /api/business/member/~/{{memberInvitationToken}}/verify`
- `POST /api/business/member/~/{{memberInvitationToken}}/answer`

### Cookie Policy
- `accessToken`: regular cookie (not httpOnly), share domain `.postmatic.id`.
- `refreshToken`: httpOnly cookie, share domain `.postmatic.id`.
- Cookie options applied in `src/action/cookies.ts` with `sameSite=lax`, `path=/`, `secure` by env.

### Turnstile Policy
- Widget rendered in client component `src/components/auth/turnstile-widget.tsx`.
- Server validates token in `src/action/turnstile.ts` via Cloudflare siteverify endpoint.
- Login/register/verify/resend actions must reject when turnstile token is invalid/missing.

### Environment Contract
Defined in root `.env`, parsed in `src/constants/env.ts`, and re-exported from `src/constants/index.ts`.

Required server keys:
- `AUTH_API_BASE_URL`
- `TURNSTILE_SECRET_KEY`

Required public key:
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Recommended keys:
- `POSTMATIC_APP_URL`
- `POSTMATIC_DEFAULT_FROM_URL`
- `POSTMATIC_REDIRECT_HOST_SUFFIX`
- `POSTMATIC_COOKIE_DOMAIN`
- `POSTMATIC_COOKIE_SECURE`
- `POSTMATIC_ACCESS_COOKIE_NAME`
- `POSTMATIC_REFRESH_COOKIE_NAME`
- `POSTMATIC_ACCESS_QUERY_KEY`
- `POSTMATIC_REFRESH_QUERY_KEY`

### Code Organization
- `src/action/auth-client.ts`: low-level HTTP client to auth API.
- `src/action/login.ts`, `register.ts`, `verify-account.ts`: server actions per flow.
- `src/action/forgot-password.ts`: forgot/reset password actions (currently mock-ready).
- `src/action/invite-member.ts`: business invitation verify/answer flow.
- `src/action/helpers.ts`: redirect sanitization, response normalization.
- `src/components/auth/*`: auth shell and form UI.
- `src/constants/env.ts`: env parsing.

### Forgot Password (Current Status)
- API is not available yet, so flow is mocked in `src/action/forgot-password.ts`.
- `getForgotPasswordTokenStatus(token)`:
  - token `"testing"` is treated as valid for development.
  - token format `testing:<email>` is also treated as valid.
  - all other tokens are invalid.
- `requestForgotPasswordAction` and `submitForgotPasswordResetAction` are implemented as Server Actions and already validate Turnstile tokens, so replacing mock with real endpoint is mostly path/contract swap.

### Redirect Hardening
- Always sanitize `from` parameter with `sanitizeFromUrl`.
- Permit `localhost`, `postmatic.id`, and subdomains ending with configured suffix.
- Fallback to `POSTMATIC_DEFAULT_FROM_URL` on invalid input.

### Notes for Future Changes
- If adding new auth flows, keep server-side token/cookie mutation inside `src/action/*`.
- Keep refresh token out of client-readable storage.
- If verify callback contract changes, update query key settings in env instead of hardcoding.
- Invite member answer currently redirects to `POSTMATIC_DEFAULT_FROM_URL` after success.
