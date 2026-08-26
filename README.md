# Monica Messer — Author Website

An [Astro](https://astro.build) site for author **Monica Messer**, built around her debut novel
*The Family Narrative*. Astro is a Node/npm framework that lets us share components (nav, footer,
newsletter) across pages, then builds everything down to a **fast static site** with no server
required to host.

## Requirements

- **Node.js 18.20.8+, 20.3+, or 22+** (works on newer too) and npm.

## Getting started

```bash
npm install        # install dependencies (first time only)
npm run dev        # local dev server with live reload → http://localhost:4321
npm run build      # build the static site into ./dist
npm run preview    # preview the built ./dist locally
```

## Project structure

```
src/
  pages/                 One file = one page (routing is automatic)
    index.astro          Homepage
    the-family-narrative.astro   Book page
    about.astro          About Monica
    writing.astro        Essays (placeholder cards)
    newsletter.astro     Newsletter signup
  layouts/
    BaseLayout.astro     <head>, fonts, announcement bar, nav, footer, client JS
  components/
    Nav.astro            Top navigation (one place to edit links)
    Footer.astro         Footer
    Newsletter.astro     Reusable signup block (Card 10)
    PullQuote.astro      Rotating pull-quote breaks (Card 8)
  styles/
    global.css           All styling. Colors & fonts are CSS variables in :root.
public/
  assets/                author-portrait.jpg, book-cover.png, gala-family.jpg, nasdaq.jpg
```

## Editing common things

- **Text/copy:** edit the matching file in `src/pages/`.
- **Nav links / footer:** edit `src/components/Nav.astro` and `Footer.astro` — once, not per page.
- **Colors & fonts:** change the variables in the `:root` block at the top of `src/styles/global.css`.
- **Images:** replace files in `public/assets/` (keep the same filenames) or update the `src="/assets/..."`
  paths. The portrait is shown in grayscale via CSS (`filter: grayscale(100%)`).
- **Pull-quotes:** pass a `quotes={[...]}` array to `<PullQuote />`; more than one rotates automatically.

## Newsletter + contact forms — collecting submissions

Both the newsletter signup (`src/components/Newsletter.astro`, plus inline on
`src/pages/newsletter.astro`) and the contact form (`src/pages/contact.astro`) post to
**`/api/submit`**, a [Cloudflare Pages Function](https://developers.cloudflare.com/pages/functions/)
at `functions/api/submit.js`. It validates the submission and emails it via
[Resend](https://resend.com) — no database or third-party form dashboard involved. The client-side
AJAX submit handler (shows the inline thank-you / error message) lives in the `.nl-form` /
`.contact-form` block in `src/layouts/BaseLayout.astro`; each form also sets `action="/api/submit"`
directly, so it still works if JavaScript fails to load.

A hidden honeypot field (`bot-field`) silently drops bot submissions.

**One-time setup (required for submissions to actually send):**

1. Create a [Resend](https://resend.com) account and an API key (resend.com/api-keys).
2. In the Cloudflare dashboard, go to **Workers & Pages → this Pages project → Settings →
   Environment variables** and add:
   - `RESEND_API_KEY` (encrypted) — the key from step 1.
   - `CONTACT_TO_EMAIL` (optional) — defaults to `monica@monicamesser.com`.
   - `CONTACT_FROM` (optional) — defaults to Resend's shared `onboarding@resend.dev` sender, which
     works immediately with no extra setup. To send *from* `monicamesser.com` instead (recommended,
     better deliverability), verify the domain in Resend — it will give you a few DKIM/SPF `TXT`
     records to add in the same Cloudflare DNS zone — then set `CONTACT_FROM` to something like
     `Monica Messer <hello@monicamesser.com>`.
3. Redeploy (or just wait for the next deploy) so the Pages Function picks up the new environment
   variables.

Because the forms and handler are shared, you only edit each once.

## Reading & downloads

- **Read Act One:** `src/pages/read.astro` (`/read/`) embeds the Act One PDF and offers a download,
  plus a placeholder "Listen" section for the forthcoming audio edition.
- **Downloadable PDFs** live in `public/downloads/`:
  - `the-family-narrative-act-one.pdf` — linked from the book page's "Start Reading Now" button.
  - `the-family-narrative-book-club-guide.pdf` — the immediate "Download the Discussion Guide" on the
    book page (no longer gated behind the newsletter).
- **Audio (to-do):** when an MP3 of Act One is ready, drop it in `public/downloads/` and replace the
  "Listen" placeholder section in `src/pages/read.astro` with an `<audio controls>` element.

## To-do as assets become available

- Replace placeholder retailer/preorder links on the book page (Amazon, Goodreads, preorder,
  press kit).
- Add real essays to `src/pages/writing.astro` (replace the three placeholder cards).
- Add the Act One audio (MP3) and wire up the "Listen" section (see *Reading & downloads*).
- Set the `RESEND_API_KEY` environment variable in Cloudflare Pages to activate form submissions
  (see *Newsletter + contact forms*).

## Deploying

The site is hosted on **Cloudflare Pages**, connected directly to this GitHub repo — build command
`npm run build`, output directory `dist`. Cloudflare auto-builds and deploys on every push to `main`,
and picks up anything in `functions/` as Pages Functions automatically (see the forms section above
for the one env-var setup step those need). Set your domain in `astro.config.mjs` (`site:
'https://…'`) before a build if it ever changes.

`npm run build` alone produces a static `./dist` folder, so the site (minus the `/api/submit`
Function) could also be deployed to any static host if needed.
