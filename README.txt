# Teacher Victor — Guided Learning Upgrade

This package is an add-on for your existing Teacher Victor website. It does not replace your Supabase project, student accounts, login, payment settings, or existing site code.

## Included files

- `teacher-victor-upgrade.css` — polished mobile styling and animated splash screen.
- `teacher-victor-upgrade.js` — subject/topic guided lesson picker and study plan.

## Install on GitHub Pages

1. Download and extract this ZIP.
2. Open your `Teacher-Victor` GitHub repository.
3. Upload `teacher-victor-upgrade.css` and `teacher-victor-upgrade.js` into the same folder as `index.html` (the repository root).
4. Edit `index.html`.
5. Inside the `<head>` section, before `</head>`, add:

   `<link rel="stylesheet" href="teacher-victor-upgrade.css">`

6. Find the existing main application `<script> ... </script>` near the bottom of `index.html`.
7. Immediately AFTER that existing script block, and before `</body>`, add:

   `<script src="teacher-victor-upgrade.js"></script>`

8. Commit the changes to the `main` branch and wait for GitHub Pages to publish.
9. Open the website, sign in, choose and save your level, then open **AI Teacher**.

## Backend status

The Supabase `web-api` Edge Function in your project was checked and is already active with:
- `case "lesson"` action
- lesson generation through the existing AI tutor
- lesson activity saved in `wa_activity`

Therefore, this add-on does not require redeploying the backend if you have not changed that function since it was checked. If you later replace the function, preserve the existing payment, authentication, marking and billing actions.

## How the study plan works

- After a guided lesson, it records the lesson in the existing activity history.
- Homework becomes available 24 hours after the lesson.
- A review test becomes available 4 days after the lesson.
- The study plan appears in **My progress**.
- Homework and tests use your existing assignment/mock generation and marking features.

This is a simple schedule based on the latest recorded lesson. It is not a push notification or background reminder: the student sees it when they open the website.

## Important checks

- Keep your Supabase publishable key in the frontend only.
- Never put `SUPABASE_SERVICE_ROLE_KEY` or `ANTHROPIC_API_KEY` in `index.html`, JavaScript assets, or GitHub Pages.
- Test with a student account after publishing. Confirm that a lesson appears in chat and that its activity appears in My progress.
