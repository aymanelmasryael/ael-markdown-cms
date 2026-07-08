# AEL | Markdown CMS — Lightweight Editor with Live Preview

> **A lightweight markdown editor** with live preview, document management, and 3 export formats.  
> Built with a custom markdown parser — zero dependencies.  
> Built by Ayman Elmasry — AEL Digital Studio.

---

## Preview

![AEL Markdown CMS Preview](screenshot.svg)

---

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Supported Markdown](#supported-markdown)
- [Technical Details](#technical-details)
- [Credits](#credits)

---

## Features

- **Live preview** — see rendered HTML as you type
- **Split pane** — editor and preview side by side
- **Toolbar** — quick markdown formatting (bold, italic, headings, lists, code, links)
- **Document management** — save, load, and delete documents (localStorage)
- **Export** — download as HTML, Markdown, or Plain Text
- **Full preview** — dedicated preview section for reading
- **Export all** — download all documents as a single markdown file
- **Custom parser** — handles headings, lists, code blocks, tables, blockquotes, images, links, inline formatting
- **Zero dependencies** — no marked.js, no showdown, no libraries

---

## How It Works

### Custom Markdown Parser

The heart of the CMS is a custom-built markdown parser that processes input line-by-line:

```
Raw Markdown → Line Tokenizer → Pattern Matcher → HTML Builder → Rendered Output
```

The parser handles these patterns:

| Pattern | Regex | Output |
|---------|-------|--------|
| `# Heading` | `/^(#{1,6})\s+(.+)$/` | `<h1>…<h6>` |
| `**bold**` | `/\*\*(.+?)\*\*/` | `<strong>` |
| `*italic*` | `/\*(.+?)\*/` | `<em>` |
| `` `code` `` | `` /`(.+?)`/ `` | `<code>` |
| `[link](url)` | `/\[(.+?)\]\((.+?)\)/` | `<a>` |
| `![alt](img)` | `/!\[(.+?)\]\((.+?)\)/` | `<img>` |
| `- item` | `/^-\s+(.+)/` | `<ul><li>` |
| `1. item` | `/^\d+\.\s+(.+)/` | `<ol><li>` |
| `> quote` | `/^>\s+(.+)/` | `<blockquote>` |
| `\| table \|` | `/\|(.+)\|/` | `<table>` |

### Document Storage

- Documents are serialized to JSON and stored in localStorage
- Each document has: `{ id, title, content, createdAt, updatedAt }`
- All operations (save, load, delete) are synchronous and instant

---

## Project Structure

```
ael-markdown-cms/
├── index.html                  # HTML5 semantic structure
├── css/
│   └── style.css               # All styles (glassmorphism, split pane)
├── js/
│   └── script.js               # Full JS engine (parser, editor, storage, export)
├── screenshot.svg              # Project preview image
├── .gitignore
└── README.md
```

This separation follows modern web best practices:
- **HTML5** — semantic elements
- **CSS3** — custom properties, split pane layout, responsive
- **Vanilla JS (ES2020+)** — custom markdown parser, localStorage, File API

---

## Getting Started

### Run Locally

```bash
git clone https://github.com/aymanelmasryael/ael-markdown-cms.git
cd ael-markdown-cms
open index.html
```

Or simply open `index.html` in any modern browser — no server required.

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools, no package managers, no server

---

## Usage

### Editor
- Write markdown in the left pane
- See live HTML preview on the right
- Use the toolbar for common markdown syntax
- Save documents with custom titles

### Documents
- All documents are stored in your browser (localStorage)
- Load, edit, and delete saved documents
- Create new documents from scratch

### Export
- **HTML** — full rendered page with styling
- **MD** — raw markdown source
- **TXT** — plain text without formatting

---

## Supported Markdown

| Syntax | Rendered As |
|--------|-------------|
| `# H1` — `###### H6` | Headings |
| `**bold**` | Bold |
| `*italic*` | Italic |
| `~~strikethrough~~` | Strikethrough |
| `[link](url)` | Link |
| `![alt](img)` | Image |
| `` `code` `` | Inline code |
| ` ``` ``` ` | Code block |
| `- item` | Unordered list |
| `1. item` | Ordered list |
| `> quote` | Blockquote |
| `---` | Horizontal rule |
| `\| table \|` | Table |

---

## Technical Details

| Aspect | Detail |
|--------|--------|
| Architecture | Static site (HTML5 + CSS3 + JS) |
| JavaScript | Vanilla ES2020+, zero dependencies |
| CSS | Custom properties for theming |
| Markdown parser | Custom-built regex-based line parser |
| Data storage | localStorage for document persistence |
| Export formats | 3 (HTML, MD, TXT) |
| Browser support | Chrome, Firefox, Safari, Edge (modern versions) |
| Offline | Fully functional after first load (CDN assets cached) |

### Performance

- Live preview updates on every keystroke with no perceptible lag
- Document operations (save/load/delete) are instant
- Export generates files in < 10ms regardless of document length

---

## Credits

**Created by:** Ayman Elmasry — AEL Digital Studio  
**Website:** [aymanelmasry.com](https://aymanelmasry.com)  
**Email:** [info@aymanelmasry.com](mailto:info@aymanelmasry.com)  
**License:** © 2026 Ayman Elmasry — AEL Digital Studio. All rights reserved.

### Connect

[LinkedIn](https://linkedin.com/in/aymanelmasryael) · [Instagram](https://instagram.com/aymanelmasryael) · [X](https://x.com/aymanelmasryael) · [CodePen](https://codepen.io/aymanelmasryael) · [GitHub](https://github.com/aymanelmasryael) · [Behance](https://behance.net/aymanelmasryael)

---

*AEL Prompt IP System v1.0 — Sovereign Identity Block*
