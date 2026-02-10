---
title: "Adding Comments and Reactions to a GitHub Pages Site with Giscus"
date: 2026-02-10
description: "How to add a GitHub-powered commenting system to your static site using Giscus, giving readers a way to leave comments and emoji reactions on your blog posts."
tags: ["GitHub Pages", "Giscus", "Blog", "Static Site"]
readTime: "8 min read"
image: "https://placehold.co/780x400/111827/a78bfa?text=Giscus+Comments+%2B+Reactions"
imageAlt: "Giscus Comments and Reactions for GitHub Pages"
---

One of the trade-offs of running a static site is that everything is, well, static. There's no server processing requests, no database storing data, and no backend logic running between page loads. That's the whole point -- it's fast, cheap, and simple. But it also means there's no built-in way for readers to interact with your content.

When I finished setting up my blog with [Eleventy and GitHub Pages](/blog/posts/setting-up-blog-github-pages-eleventy/), I immediately started thinking about engagement. Even if traffic is modest (and let's be honest, I'm optimistically assuming people will actually read these posts), having a way for readers to leave a comment or react to a post makes the site feel less like a one-way broadcast and more like a conversation.

The usual solutions for static site comments have their downsides. Disqus is heavy, loads third-party ads, and tracks users. Building a custom backend defeats the purpose of going static. Then I found [Giscus](https://giscus.app/) -- a commenting system powered by GitHub Discussions. It checks every box: free, open source, no tracking, no ads, and your readers authenticate with GitHub (which is perfect for a developer-focused blog). On top of that, it comes with built-in emoji reactions on every post, so you get both comments and a lightweight "like" system without any extra setup.

In this post, I'll walk through how to add Giscus to your GitHub Pages site.

## What Giscus Does

Giscus embeds an iframe on your page that connects to your repository's GitHub Discussions. When a reader leaves a comment, it creates (or appends to) a Discussion thread in your repo. Reactions work the same way -- they're GitHub's native emoji reactions on the Discussion post.

This means:

- **Comments are stored in GitHub Discussions** -- you own the data, it's in your repo, and you can moderate from GitHub's interface
- **Authentication is via GitHub** -- no separate accounts needed, and since your audience is likely developers, they already have one
- **Reactions are built in** -- readers can add emoji reactions without writing a comment
- **Theming matches your site** -- Giscus supports dark and light themes out of the box
- **No database or backend** -- it's just a `<script>` tag

## Prerequisites

Before setting up Giscus, you need:

- A **public** GitHub repository (Giscus can't access private repos)
- **GitHub Discussions** enabled on the repository
- The **Giscus GitHub App** installed on the repository

## Step 1: Enable GitHub Discussions

Go to your repository on GitHub, then **Settings > General**. Scroll down to the **Features** section and check **Discussions**.

![Enable Discussions in repository settings](https://placehold.co/780x300/111827/60a5fa?text=Settings+%E2%86%92+General+%E2%86%92+Features+%E2%86%92+Discussions)

This creates a Discussions tab in your repo with default categories like Announcements, General, Ideas, Q&A, and more.

## Step 2: Install the Giscus App

Head to [github.com/apps/giscus](https://github.com/apps/giscus) and click **Install**. Select your repository (or all repositories if you prefer) and confirm.

This grants Giscus the permissions it needs to read and create Discussions on your behalf when someone comments through the widget.

## Step 3: Configure Giscus

Go to [giscus.app](https://giscus.app/) and fill in the configuration form:

1. **Repository** -- enter your repo in `owner/repo` format (e.g., `aaronmedina-dev/aaronmedina-dev.github.io`)
2. **Discussion Category** -- select **Announcements**. This is recommended because only maintainers can create new Announcements, which prevents spam. Giscus creates the initial Discussion when the first comment is posted, and it does so as an authorized app.
3. **Page-Discussion Mapping** -- select **pathname**. This maps each page's URL path to a Discussion, so every blog post gets its own thread automatically.
4. **Features** -- enable **reactions on the main post** to let readers add emoji reactions without commenting.
5. **Theme** -- select **dark** (or whichever matches your site).

The page will generate a `<script>` tag with all your configuration values. It looks like this:

```html
<script src="https://giscus.app/client.js"
    data-repo="your-username/your-repo"
    data-repo-id="your-repo-id"
    data-category="Announcements"
    data-category-id="your-category-id"
    data-mapping="pathname"
    data-strict="0"
    data-reactions-enabled="1"
    data-emit-metadata="0"
    data-input-position="top"
    data-theme="dark"
    data-lang="en"
    data-loading="lazy"
    crossorigin="anonymous"
    async>
</script>
```

The `data-repo-id` and `data-category-id` are unique to your repository. The giscus.app configurator fills these in automatically when you enter your repo name.

## Step 4: Add Giscus to Your Blog Layout

If you're using Eleventy with Nunjucks layouts (like in my [previous post](/blog/posts/setting-up-blog-github-pages-eleventy/)), add the Giscus script to your blog post layout file.

Open your blog post layout (e.g., `_includes/layouts/blog-post.njk`) and add a comments section after the article:

```html
    </article>

    <section class="comments-section">
        <h2>Comments</h2>
        <script src="https://giscus.app/client.js"
            data-repo="your-username/your-repo"
            data-repo-id="your-repo-id"
            data-category="Announcements"
            data-category-id="your-category-id"
            data-mapping="pathname"
            data-strict="0"
            data-reactions-enabled="1"
            data-emit-metadata="0"
            data-input-position="top"
            data-theme="dark"
            data-lang="en"
            data-loading="lazy"
            crossorigin="anonymous"
            async>
        </script>
    </section>
</div>
```

Replace the `data-repo`, `data-repo-id`, `data-category`, and `data-category-id` values with the ones generated by giscus.app.

Key configuration choices:

- **`data-mapping="pathname"`** -- each blog post URL gets its own Discussion thread. When someone comments on `/blog/posts/my-post/`, the Discussion is titled with that path.
- **`data-reactions-enabled="1"`** -- shows emoji reaction buttons on the post, separate from comments.
- **`data-input-position="top"`** -- puts the comment input box above existing comments, so readers don't have to scroll past all comments to write one.
- **`data-loading="lazy"`** -- the widget only loads when the user scrolls to it, keeping initial page load fast.
- **`data-theme="dark"`** -- matches a dark-themed site. Giscus also supports `light`, `preferred_color_scheme` (follows system settings), and custom theme URLs.

## Step 5: Add Some CSS

Add basic styling for the comments section to visually separate it from the article content:

```css
/* Comments Section (Giscus) */
.comments-section {
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid var(--border);
}

.comments-section h2 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 24px;
}

.giscus {
    max-width: 100%;
}
```

The `.giscus` class targets the iframe that Giscus injects. Setting `max-width: 100%` ensures it doesn't overflow on smaller screens.

## Step 6: Build and Test

Build your site and check a blog post:

```bash
npm run serve
```

Navigate to any blog post and scroll to the bottom. You should see the Giscus widget with:

- A comment input box at the top
- Emoji reaction buttons below the post
- A "Sign in with GitHub" prompt for unauthenticated visitors

![Giscus comments widget on a blog post](https://placehold.co/780x350/111827/a78bfa?text=Comments+Section+with+Giscus+Widget)

Try signing in and leaving a test comment. Then check your repository's **Discussions** tab -- you'll see a new Discussion created under the Announcements category, titled with the page's pathname.

## How It Works Behind the Scenes

When a reader visits a blog post:

1. The Giscus script loads lazily (only when scrolled into view)
2. It checks your repo's Discussions for a thread matching the current pathname
3. If a Discussion exists, it loads the comments and reactions
4. If not, the first person to comment or react triggers the creation of a new Discussion

All data lives in your GitHub repository. If you ever want to remove Giscus, just delete the `<script>` tag -- your Discussions and comments stay in GitHub, and your blog posts go back to being purely static.

## Moderation

Since comments are GitHub Discussions, you get GitHub's full moderation tools:

- **Lock** a Discussion to prevent new comments
- **Delete** individual comments or entire Discussions
- **Hide** comments that violate guidelines
- **Pin** important Discussions
- **Category-level permissions** -- Announcements can only be created by maintainers

You manage all of this from your repo's Discussions tab, not through a separate dashboard.

---

That's the full setup. With a single `<script>` tag and a few lines of CSS, your static site now has a commenting system backed by GitHub Discussions, complete with emoji reactions and moderation tools. No backend, no database, no third-party tracking -- just your repo and your readers.
