# Portfolio & Internal Tooling

Personal portfolio and internal tooling application for **Angga Prabowo**, a Software Engineer based in South Tangerang, Indonesia.

The project combines a public portfolio website with an internal documentation platform used for managing Design & Development Documents (DDE), integrating with Google Workspace services.

---

## Tech Stack

- SvelteKit 2
- Svelte 5 (Runes)
- TypeScript (Strict Mode)
- TailwindCSS v4
- Google Docs API
- Google Sheets API
- Google Drive API
- Puppeteer
- LibreOffice
- docxtemplater
- Zod
- pnpm Workspaces

---

## Features

### Portfolio

- About
- Experience
- Projects
- Blog (powered by dev.to)

### Internal Tooling

- DDE Management
- Google Sheets integration
- Google Docs export
- DOCX generation
- PDF export
- Ticket management

---

## Project Structure

```text
src/routes/
├── +page.svelte
├── +layout.svelte
├── blog/
├── experience/
├── projects/
├── tools/
├── dev/
└── api/
```

---

## Environment Variables

Create a `.env` file.

```env
GOOGLE_SERVICE_ACCOUNT=
GOOGLE_SHEET_ID=
```

`GOOGLE_SERVICE_ACCOUNT` should contain the complete Service Account JSON as a single string.

---

## Development

Install dependencies

```bash
pnpm install
```

Run development server

```bash
pnpm dev
```

Build

```bash
pnpm build
```

Preview

```bash
pnpm preview
```

---

## Core Domain

### DDE (Design & Development Document)

A DDE represents a technical specification linked to a project ticket.

Each document contains:

- metadata
- project information
- revision history
- process flow
- UI design
- database design

Data is stored in Google Sheets and exported into Google Docs or DOCX.

---

## Navigation

The application has two operating modes.

### Portfolio Mode

Shows

- Blog
- Experience
- Projects

### Company Mode

Route:

```
/dev/{company}
```

Example

```
/dev/dataon
```

Navigation switches to internal tooling only.
