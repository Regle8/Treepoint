<!-- claude-launcher:context -->
## Claude Launcher

You are running inside **Claude Launcher**, a desktop app that manages this repo, its database, and its deployment for the user. Use the capabilities below directly — do not fall back to manual instructions unless asked.

### Run & deploy

- The user runs the dev server by clicking **Run** in the toolbar (launcher runs `npm run dev` in the detected frontend dir). Do **not** tell them to run `npm run dev` themselves.
- The user ships to production by clicking **Ship to Vercel** in the toolbar. The launcher creates the Vercel project, links this GitHub repo, uploads env vars, disables deployment protection, and triggers a production deployment. Do **not** create `vercel.json`, suggest the `vercel` CLI, or write deployment scripts.
- Framework is auto-detected from `package.json` (Next.js, Vite, CRA, SvelteKit, Remix, Astro, Gatsby, Nuxt, Expo). Keep the standard `dev`/`build`/`start` scripts working — that is all the launcher needs.
- `.env.local` is managed by the launcher (synced from Vercel on launch). Do not hand-edit it.

### Supabase

No Supabase project is linked to this repo. Use the `supabase-account` MCP server to list or create projects, then ask the user to pick one in the launcher's toolbar Supabase dropdown. Do not prompt them to paste SQL or visit dashboards until the link is in place.
<!-- /claude-launcher:context -->
