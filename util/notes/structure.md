# Site Architecture & Blog Guide

## Overview
Static portfolio site on GitHub Pages using **Eleventy (11ty)** for blog generation.
Homepage and tool pages are untouched passthrough files. Only the blog section is processed by 11ty.

## Project Structure
```
/
├── .eleventy.js              # 11ty config
├── package.json              # Node deps (11ty)
├── .github/workflows/
│   └── deploy.yml            # Build + deploy to GitHub Pages
├── _includes/layouts/
│   ├── blog-post.njk         # Article page layout (shared HTML wrapper)
│   └── blog-listing.njk      # Blog index layout
├── _data/
│   └── site.json             # Site metadata (url, author, role)
├── blog/
│   ├── index.njk             # Blog listing (just front matter)
│   ├── css/styles.css        # Blog-specific styles
│   └── posts/
│       ├── posts.json        # Auto-applies layout + permalink to all .md
│       └── *.md              # Blog posts (Markdown + front matter)
├── assets/
│   ├── css/global.css        # Shared CSS (theme vars, grid background)
│   └── js/
│       ├── grid-background.js  # Interactive dot grid effect
│       └── utils.js          # Clipboard/download helpers
├── index.html                # Homepage (passthrough, not processed)
├── pert/                     # Tool (passthrough)
├── cidr-calculator/          # Tool (passthrough)
├── aikido/                   # Tool (passthrough)
├── whatthepatch/             # Docs (passthrough)
├── sitemap.njk               # Auto-generated sitemap
├── robots.txt                # SEO
└── favicon.svg               # Site icon
```

Output: `_site/` (built by 11ty, deployed by GitHub Actions)

## Creating a New Blog Post

### Step 1: Create the Markdown file
Create `blog/posts/<slug>.md` where `<slug>` becomes the URL.
Example: `blog/posts/kubernetes-basics.md` -> `/blog/posts/kubernetes-basics/`

### Step 2: Add front matter
```yaml
---
title: "Your Post Title"
date: 2026-03-01
description: "One-line description for SEO and listing cards"
tags: ["Tag1", "Tag2", "Tag3"]
readTime: "5 min read"
image: "https://placehold.co/780x400/111827/3b82f6?text=Your+Title"
imageAlt: "Description of the image"
---
```

### Step 3: Write content in Markdown
```markdown
Opening paragraph here.

## Section Heading

Regular paragraph with **bold** and `inline code`.

### Subsection

- Bullet point
- Another point

1. Numbered list
2. Second item

> Blockquote for callouts

![Alt text](https://example.com/image.png)

Code block with syntax highlighting hint:
```yaml
name: Example
on: push
```

---

Closing paragraph.
```

### Step 4: Commit and push
That's it. 11ty auto-generates:
- The article page at `/blog/posts/<slug>/`
- A card on the blog listing page
- Previous/Next navigation links
- A sitemap entry

## Local Development

```bash
npm run serve    # Dev server at http://localhost:8080 (hot reload)
npm run build    # One-off build to _site/
```

## How It Works

### Layouts
Two Nunjucks layouts in `_includes/layouts/` contain ALL shared HTML:
- **blog-post.njk**: Full article page (meta tags, canvas, header, content, footer, nav)
- **blog-listing.njk**: Blog index (meta tags, canvas, post card loop)

When you change something in a layout, it applies to ALL pages using that layout.

### Directory Data
`blog/posts/posts.json` auto-applies to every `.md` file in that folder:
```json
{
    "layout": "layouts/blog-post.njk",
    "permalink": "/blog/posts/{{ page.fileSlug }}/"
}
```
No need to set layout or permalink in each post's front matter.

### Collections
`.eleventy.js` defines a `posts` collection from `blog/posts/*.md`, sorted newest-first.
The listing page and prev/next nav both use this collection.

### Sitemap
`sitemap.njk` has hardcoded entries for static pages and auto-generates entries for blog posts from the collection.

### Passthrough
Everything except `.njk` and `.md` files is copied as-is to `_site/`.
Homepage, tool pages, CSS, JS, images -- all untouched.

## Deployment
- **Trigger**: Push to `main` branch
- **Workflow**: `.github/workflows/deploy.yml`
- **Steps**: Checkout -> Node 20 -> npm ci -> eleventy build -> deploy to Pages
- **Requirement**: GitHub Pages source must be set to "GitHub Actions" (not branch)

## Gotchas
- ALL `.md` files in the project get processed. Non-blog ones (AGENTS.md, README.md) must be added to `eleventyConfig.ignores` in `.eleventy.js`
- Blog CSS sets `body { padding: 0 }` to override global.css `padding: 20px`
- `html { background-color }` in global.css prevents white bleed at page edges
- The `isoDate` filter handles the string `"now"` specially for the sitemap
- Posts are sorted newest-first; "Previous" = older post, "Next" = newer post
- The `image` front matter field is optional -- omit it for no hero image
