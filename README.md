# TEACHER VICTOR website

This is a responsive ZIMSEC O-Level and A-Level student website connected to the existing Supabase project `zimsec-ai-teacher`.

## Included
- Student email/password sign-up and sign-in
- Student level selection (Forms 1–4, Lower 6, Upper 6)
- AI tutor chat using the existing `web-api` Edge Function
- Generated homework, mock papers, marking and feedback
- Revision notes and progress reports
- 30-day trial tracked in the database
- $5 monthly membership order and EcoCash payment submission
- Payment activation remains manual until the payment is verified by an administrator

## Supabase configuration
The site is already configured with the existing Supabase project URL and publishable key in `index.html`. The publishable key is intended for browser use. Never place a service-role key or AI provider key in this file.

Backend changes applied:
- `wa_users.trial_started_at` and `wa_users.trial_ends_at` added with a 30-day default.
- `web-api` Edge Function deployed as version 2 to check trial access.
- Monthly membership price fixed to USD 5.
- Mock exams included in membership access.

## Preview locally
You can open `index.html` in a browser for a visual preview. For full sign-in and AI features, host the folder on a static web host (for example, GitHub Pages or Netlify) and make sure Supabase Auth email settings allow your chosen site URL.

## Important setup checks before public launch
1. In Supabase Auth, set the correct Site URL and allowed redirect URLs for the final domain.
2. Ensure email confirmation is configured as intended.
3. Check that the `web-api` Edge Function has its required server-side secrets configured: `ANTHROPIC_API_KEY`, and Supabase's built-in service role settings.
4. Test a new student account and confirm the 30-day trial starts at account creation.
5. Confirm the EcoCash payment workflow with a small test order. Payment is not automatic: a trusted admin must verify the transaction before access is granted.
6. Review Supabase security advisors and restrict any admin-only functions to the owner/admin roles.

Students under 18 should involve a parent or guardian in payment decisions. Never ask students for an EcoCash PIN or password.
