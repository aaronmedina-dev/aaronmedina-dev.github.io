---
title: "Setting Up a Blog on GitHub Pages with Eleventy"
date: 2026-02-09
description: "A step-by-step guide to building a blog with Eleventy and deploying it to GitHub Pages using GitHub Actions, with Markdown posts and auto-generated listings."
tags: ["GitHub Pages", "Eleventy", "Blog", "Static Site"]
readTime: "15 min read"
image: "https://placehold.co/780x400/111827/22c55e?text=GitHub+Pages+%2B+Eleventy+Blog"
imageAlt: "GitHub Pages and Eleventy Blog Setup"
---

I recently migrated this blog from hand-written HTML to [Eleventy (11ty)](https://www.11ty.dev/) and the workflow improvement has been significant. New posts are now just a single Markdown file -- no folders to create, no listing page to update, no sitemap to maintain. In this post, I'll walk through the entire setup from scratch so you can build the same thing.

## What We're Building

By the end of this guide, you'll have:

- A blog powered by **Eleventy** (a lightweight static site generator)
- Posts written in **Markdown** with YAML front matter
- An **auto-generated listing page** that shows all posts as cards
- **Previous/Next navigation** between posts
- An **auto-generated sitemap** for SEO
- **GitHub Actions** building and deploying to **GitHub Pages** on every push

The workflow for publishing a new post becomes: create a `.md` file, commit, push. That's it.

## Prerequisites

- A GitHub account
- Node.js 18+ installed locally
- Basic familiarity with Git, HTML, and Markdown

## Step 1: Create the GitHub Repository

Head to [github.com/new](https://github.com/new) and create a new repository.

![Create new GitHub repository](https://placehold.co/780x400/111827/60a5fa?text=GitHub+%E2%86%92+New+Repository)

For a personal GitHub Pages site, name it `<your-username>.github.io`. For a project site, any name works -- it'll be served at `<your-username>.github.io/<repo-name>/`.

**Important settings:**
- Set it to **Public** (required for GitHub Pages on free plans)
- Check **Add a README file**
- Add a `.gitignore` template for **Node**

Clone the repo locally:

```bash
git clone https://github.com/<your-username>/<your-username>.github.io.git
cd <your-username>.github.io
```

## Step 2: Install Eleventy

Initialize the project and install Eleventy as a dev dependency:

```bash
npm init -y
npm install --save-dev @11ty/eleventy
```

Update the `scripts` section in `package.json`:

```json
{
  "scripts": {
    "build": "npx @11ty/eleventy",
    "serve": "npx @11ty/eleventy --serve"
  }
}
```

Add `_site/` to your `.gitignore` (this is the build output directory):

```
node_modules/
_site/
.DS_Store
```

## Step 3: Configure Eleventy

Create `.eleventy.js` in the project root. This is the configuration file that tells Eleventy what to process and what to copy as-is:

```js
module.exports = function (eleventyConfig) {
    // Copy static assets to output without processing
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("favicon.svg");

    // Blog posts collection sorted newest-first
    eleventyConfig.addCollection("posts", function (collectionApi) {
        return collectionApi
            .getFilteredByGlob("blog/posts/*.md")
            .sort(function (a, b) {
                return b.date - a.date;
            });
    });

    // Date formatting filter: "Jan 15, 2026"
    eleventyConfig.addFilter("dateFormat", function (date) {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    });

    // ISO date filter for sitemap
    eleventyConfig.addFilter("isoDate", function (date) {
        var d = date === "now" ? new Date() : new Date(date);
        return d.toISOString().split("T")[0];
    });

    return {
        dir: {
            input: ".",
            output: "_site",
            includes: "_includes",
            data: "_data",
        },
        templateFormats: ["njk", "md"],
    };
};
```

Key things happening here:

- **`addPassthroughCopy`** -- copies files/folders to `_site/` without processing them
- **`addCollection`** -- creates a "posts" collection from all `.md` files in `blog/posts/`, sorted by date (newest first)
- **`addFilter`** -- custom Nunjucks filters for formatting dates
- **`templateFormats: ["njk", "md"]`** -- only processes `.njk` and `.md` files. All `.html` files are ignored, which is useful if you have static pages alongside your blog

## Step 4: Create the Site Data File

Create `_data/site.json` to store site-wide metadata. This data is available in all templates as `site.*`:

```json
{
    "url": "https://<your-username>.github.io",
    "title": "Your Name",
    "author": "Your Name",
    "authorRole": "Your Role"
}
```

## Step 5: Create the Blog Post Layout

This is the biggest time-saver. Instead of repeating the full HTML structure in every post, you define it once as a **layout**.

Create `_includes/layouts/blog-post.njk`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{{ "{{ description " }}}}">
    <link rel="canonical" href="{{ "{{ site.url " }}}}{{ "{{ page.url " }}}}">
    <title>{{ "{{ title " }}}} | {{ "{{ site.title " }}}}</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
    <article>
        <header>
            <a href="/blog/">Back to Blog</a>
            <h1>{{ "{{ title " }}}}</h1>
            <time>{{ "{{ date | dateFormat " }}}}</time>
            <span>{{ "{{ readTime " }}}}</span>
            <div>
                {{ "{%- for tag in tags " }}%}
                <span>{{ "{{ tag " }}}}</span>
                {{ "{%- endfor " }}%}
            </div>
        </header>

        <div class="article-body">
            {{ "{% if image " }}%}
            <img src="{{ "{{ image " }}}}" alt="{{ "{{ imageAlt " }}}}">
            {{ "{% endif " }}%}

            {{ "{{ content | safe " }}}}
        </div>

        <footer>
            <p>Written by {{ "{{ site.author " }}}}</p>

            {{ "{% set posts = collections.posts " }}%}
            {{ "{% set prevPost = null " }}%}
            {{ "{% set nextPost = null " }}%}
            {{ "{% for post in posts " }}%}
                {{ "{% if post.url == page.url " }}%}
                    {{ "{% if loop.index0 > 0 " }}%}
                        {{ "{% set nextPost = posts[loop.index0 - 1] " }}%}
                    {{ "{% endif " }}%}
                    {{ "{% if loop.index0 < posts.length - 1 " }}%}
                        {{ "{% set prevPost = posts[loop.index0 + 1] " }}%}
                    {{ "{% endif " }}%}
                {{ "{% endif " }}%}
            {{ "{% endfor " }}%}

            <nav>
                {{ "{% if prevPost " }}%}
                <a href="{{ "{{ prevPost.url " }}}}">Previous Post</a>
                {{ "{% endif " }}%}
                {{ "{% if nextPost " }}%}
                <a href="{{ "{{ nextPost.url " }}}}">Next Post</a>
                {{ "{% endif " }}%}
            </nav>
        </footer>
    </article>
</body>
</html>
```

The key line is `{{ "{{ content | safe " }}}}` -- this is where your Markdown content gets injected. The `safe` filter tells Nunjucks not to escape the HTML that Markdown generates.

The previous/next navigation loops through the posts collection to find adjacent posts automatically. You never have to manage these links manually.

## Step 6: Create the Blog Listing Layout

Create `_includes/layouts/blog-listing.njk` for the index page that shows all posts:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{{ "{{ description " }}}}">
    <title>{{ "{{ title " }}}} | {{ "{{ site.title " }}}}</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
    <h1>{{ "{{ title " }}}}</h1>
    <p>{{ "{{ description " }}}}</p>

    <div class="post-list">
        {{ "{% for post in collections.posts " }}%}
        <a href="{{ "{{ post.url " }}}}" class="post-card">
            <time>{{ "{{ post.date | dateFormat " }}}}</time>
            <h2>{{ "{{ post.data.title " }}}}</h2>
            <p>{{ "{{ post.data.description " }}}}</p>
            <div class="tags">
                {{ "{% for tag in post.data.tags " }}%}
                <span>{{ "{{ tag " }}}}</span>
                {{ "{% endfor " }}%}
            </div>
        </a>
        {{ "{% endfor " }}%}
    </div>
</body>
</html>
```

This loops through `collections.posts` (the collection we defined in `.eleventy.js`) and generates a card for each post. When you add a new post, it appears here automatically.

## Step 7: Set Up the Blog Directory

Create the blog directory structure:

```bash
mkdir -p blog/posts
```

Create `blog/index.njk` -- this is the listing page. It's minimal because the layout does all the work:

```yaml
---
layout: layouts/blog-listing.njk
title: Blog
description: My thoughts on development, DevOps, and technology.
permalink: /blog/
---
```

Create `blog/posts/posts.json` -- this is a **directory data file** that automatically applies to every `.md` file in the folder:

```json
{
    "layout": "layouts/blog-post.njk",
    "permalink": "/blog/posts/{{ "{{ page.fileSlug " }}}}/"
}
```

This means you never need to specify the layout or permalink in your post front matter. Every `.md` file in `blog/posts/` automatically uses the blog-post layout and gets a clean URL based on its filename.

## Step 8: Write Your First Post

Create `blog/posts/hello-world.md`:

```markdown
---
title: "Hello World: My First Post"
date: 2026-02-09
description: "Welcome to my new blog built with Eleventy and GitHub Pages."
tags: ["Blog", "Getting Started"]
readTime: "2 min read"
---

This is my first blog post! I built this blog using:

- **Eleventy** for static site generation
- **Markdown** for writing posts
- **GitHub Pages** for hosting
- **GitHub Actions** for automated deployment

## Why Eleventy?

Eleventy is lightweight, flexible, and doesn't impose any framework
on your output. You get exactly the HTML you write in your templates,
nothing more.

## What's Next

I'll be writing about development, DevOps, and things I learn along
the way. Stay tuned!
```

Test it locally:

```bash
npm run serve
```

Open `http://localhost:8080/blog/` and you should see your post listed. Click through to see the full article with the layout applied.

![Local development server showing blog](https://placehold.co/780x350/111827/4ade80?text=localhost:8080/blog+%E2%86%92+Post+Cards)

## Step 9: Create the Sitemap

Create `sitemap.njk` in the project root. This auto-generates an XML sitemap that includes all blog posts:

```xml
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>{{ "{{ site.url " }}}}/</loc>
        <lastmod>{{ "{{ \"now\" | isoDate " }}}}</lastmod>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>{{ "{{ site.url " }}}}/blog/</loc>
        <lastmod>{{ "{{ \"now\" | isoDate " }}}}</lastmod>
        <priority>0.9</priority>
    </url>
    {{ "{%- for post in collections.posts " }}%}
    <url>
        <loc>{{ "{{ site.url " }}}}{{ "{{ post.url " }}}}</loc>
        <lastmod>{{ "{{ post.date | isoDate " }}}}</lastmod>
        <priority>0.7</priority>
    </url>
    {{ "{%- endfor " }}%}
</urlset>
```

New posts are automatically added to the sitemap when built.

## Step 10: Set Up GitHub Actions

Create `.github/workflows/deploy.yml` to automatically build and deploy on every push:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build with Eleventy
        run: npx @11ty/eleventy

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

This workflow:

1. Checks out your code
2. Sets up Node.js 20 with npm caching
3. Installs dependencies
4. Builds the site with Eleventy
5. Uploads the `_site/` directory as an artifact
6. Deploys it to GitHub Pages

## Step 11: Configure GitHub Pages

Push everything to GitHub:

```bash
git add -A
git commit -m "initial blog setup with eleventy"
git push origin main
```

Then go to your repository **Settings > Pages** and change the **Source** from "Deploy from a branch" to **"GitHub Actions"**.

![GitHub Pages settings showing GitHub Actions as source](https://placehold.co/780x300/111827/f59e0b?text=Settings+%E2%86%92+Pages+%E2%86%92+Source:+GitHub+Actions)

This tells GitHub to use your custom workflow instead of its built-in Jekyll or static deployment. Without this change, your workflow will build but the deploy step will fail.

After about a minute, your site should be live at `https://<your-username>.github.io/blog/`.

## The Final Workflow

With everything set up, publishing a new post is three steps:

```bash
# 1. Create the post
touch blog/posts/my-new-topic.md
# 2. Write content (front matter + markdown)
# 3. Push
git add blog/posts/my-new-topic.md
git commit -m "new post: my new topic"
git push
```

Eleventy and GitHub Actions handle everything else -- the article page, the listing card, the navigation links, and the sitemap entry.

## Project Structure Reference

Here's what the final directory structure looks like:

```
your-site/
├── .eleventy.js              # Eleventy configuration
├── .github/workflows/
│   └── deploy.yml            # Build + deploy workflow
├── _data/
│   └── site.json             # Site metadata
├── _includes/layouts/
│   ├── blog-post.njk         # Article page layout
│   └── blog-listing.njk      # Blog index layout
├── assets/
│   └── css/styles.css        # Your styles
├── blog/
│   ├── index.njk             # Blog listing page
│   └── posts/
│       ├── posts.json        # Directory data (auto-applies layout)
│       ├── hello-world.md    # Your posts
│       └── another-post.md
├── sitemap.njk               # Auto-generated sitemap
├── package.json
└── .gitignore
```

## Tips and Gotchas

- **All `.md` files get processed** -- if you have README.md or other markdown files outside of `blog/posts/`, add them to `eleventyConfig.ignores` in `.eleventy.js`
- **The `posts.json` directory data file is powerful** -- it applies layout and permalink to every `.md` file in the folder automatically, saving you from repeating it in every post
- **Dates matter** -- Eleventy uses the `date` field in front matter for sorting. Use `YYYY-MM-DD` format
- **The filename becomes the URL** -- `my-post-slug.md` becomes `/blog/posts/my-post-slug/`
- **Hot reload works** -- `npm run serve` watches for changes and reloads the browser automatically
- **You can mix static and generated pages** -- set `templateFormats: ["njk", "md"]` and Eleventy ignores `.html` files, letting you keep static pages alongside your blog

---

That's the complete setup. The initial configuration takes some effort, but once it's done, you get the best of both worlds -- the simplicity of writing in Markdown with the performance and reliability of a static site hosted for free on GitHub Pages.
