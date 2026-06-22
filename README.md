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

## Newsletter forms — collecting names & emails

The signup forms are wired for **[Netlify Forms](https://docs.netlify.com/forms/setup/)**, so when
the site is deployed to Netlify every submission (name + email) is captured automatically and can be
viewed/exported as a CSV from **Netlify → your site → Forms → `newsletter`**. No server or extra
account is required. The form markup lives in `src/components/Newsletter.astro` (and inline on
`src/pages/newsletter.astro`); the submit handling is the `.nl-form` block in
`src/layouts/BaseLayout.astro` (it AJAX-posts to Netlify and shows an inline thank-you).

A hidden honeypot field (`bot-field`) filters out basic spam.

**Hosting note:** form capture only works on **Netlify**. The page still shows the thank-you message
anywhere, but submissions are only stored when hosted on Netlify. To use a different provider instead:

- **Mailchimp / Kit (ConvertKit):** replace the `<form>` with the provider's embed code, or point
  the form `action` at their POST URL and remove the `.nl-form` handler in the layout.
- **Substack:** simplest — swap the form for a link/button to your Substack page.

Because the form is a shared component, you only edit it once.

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
- Deploy to Netlify to activate name/email capture (see *Newsletter forms*).

## Deploying

`npm run build` produces a static `./dist` folder. Deploy it anywhere:

- **Netlify / Vercel:** connect the Git repo — build command `npm run build`, output dir `dist`
  (both platforms auto-detect Astro). Or drag-and-drop the built `dist/` folder.
- **GitHub Pages / any static host:** upload the contents of `dist/`.
- Set your domain in `astro.config.mjs` (`site: 'https://…'`) before the final build.
