---
title: "How I Set Up My Projects Locally with Claude Code"
date: 2026-04-10
description: "A walkthrough of how I keep Claude Code configuration in a separate repo from application code — the reasoning, the setup workflow, and when this approach makes sense for you."
tags: ["Claude", "AI", "Productivity"]
readTime: "10 min read"
image: "/blog/images/config-repo-structure.svg"
imageAlt: "Config repo structure showing Claude configuration separate from application code"
---

Most implementations of Claude Code I've come across keep everything in one place: `.claude/`, `CLAUDE.md`, application code, all in the same repo. That's the standard approach, it's what Anthropic's documentation describes, and it's what the tooling is designed for. There's nothing wrong with it.

What I'm about to describe is a personal preference. It's based on how I like to organise my work, not a recommendation that everyone should follow. After setting up a few projects, I found that keeping my Claude configuration in its own repo, completely separate from the application code, suits the way I think about tooling versus source code. The app repo goes inside as a git-ignored subdirectory. It's an extra step, and for a lot of projects the inline approach is perfectly fine. But there are a few reasons I find this worth the effort, and this post walks through the setup, the thinking behind it, and when it might make sense for you too.

## Why I Prefer a Separate Claude Companion Repo

The core benefit is separation of concerns. Claude configuration is about how *I work with* the code. The application code is the code itself. They serve different audiences, change at different rates, and have different visibility requirements.

When I open Claude Code from the companion repo root, it reads `.claude/` from there and has full access to the application code inside. Every agent, skill, command, and rule is available. But the application repo itself doesn't know or care that Claude configuration exists. It's just code.

This means a few things in practice:

- **The app repo stays clean.** No `.claude/` directory, no `CLAUDE.md`, no `DOCS/` folder cluttering the project. If I stop using Claude Code tomorrow, the app repo is exactly as it would have been without it.
- **Claude config is versioned independently.** I can iterate on agents, skills, and rules without creating noise in the app's git history. Configuration changes don't show up in pull requests for application features.
- **Standardisation changes stay out of app PRs.** When you manage Claude configuration in the same repo as application code, every tweak to an agent definition, every new rule, every skill update creates a commit in the app's history. That means pull requests for application features end up with unrelated Claude config diffs mixed in. Reviewers see changes to `.claude/agents/blog-agent.md` alongside changes to `src/components/Header.tsx` and have to mentally separate what's relevant. Over time, the git history fills with configuration churn that has nothing to do with the application itself. Keeping them in separate repos means application PRs contain only application changes, and Claude configuration PRs contain only configuration changes. Clean history, clean reviews.
- **Every project gets the same setup.** Clone the app repo inside a companion repo, run `/setup-project`, and I'm ready to go.
- **Works with repos you don't own.** If you're contributing to an open-source project, a company monorepo, or a client's codebase, you probably shouldn't (and often can't) commit `.claude/` to their repo. A companion repo gives you a full Claude setup without touching their code. Your conventions, your agents, your workflows, none of it lands in a PR for the maintainers to deal with.

![Config repo structure showing Claude configuration separate from application code](/blog/images/config-repo-structure.svg)

### Something to Consider with Public Repos

This is where the separation becomes especially useful. If your project is public and you commit `.claude/` to it, everything inside is public too.

![What becomes visible when .claude/ is in a public repo](/blog/images/public-repo-privacy.svg)

`CLAUDE.md` is a structured map of your codebase (architecture, conventions, integration points) written for an AI to navigate efficiently. Agent definitions reveal your domain boundaries. Skills encode your workflows and expertise. Rules capture your quality standards. That's useful context for Claude, but it's also a fairly detailed picture of how you work and what you know about your codebase.

There's a meaningful difference between sharing your code (which you want to do with open source) and sharing your entire process for working with that code. Keeping the configuration separate means you can have a public application repo while your workflows, documentation, and domain knowledge stay private. Not because they're secret, but because they're yours.

If you want a middle ground, a hybrid approach works well here too. Commit a minimal `.claude/` to the public repo with basic rules and a lightweight `CLAUDE.md`, and keep the full configuration in the separate companion repo. Contributors get a decent Claude Code experience when they clone the project, and your deeper setup stays private.

## The Setup

Here's the actual sequence I follow every time I start with a new project.

![The setup workflow: create companion repo, clone app repo, run /setup-project](/blog/images/setup-workflow.svg)

### 1. Create the Companion Repo

```bash
mkdir my-project-claude && cd my-project-claude
git init
```

The naming convention I use is `{project-name}-claude`. Simple enough to know what it is at a glance when browsing my workspace.

### 2. Clone the App Repo Inside

```bash
git clone https://github.com/you/my-project.git
```

This creates `my-project/` inside the companion repo. It's a normal git repo with its own history and remotes. The companion repo doesn't interfere with it.

### 3. Set Up .gitignore

```
# Application source (managed separately)
my-project/

# OS files
.DS_Store

# Override global gitignore to track CLAUDE.md
!CLAUDE.md
```

The important line is `my-project/`. The companion repo never commits the application code. The `!CLAUDE.md` line overrides global gitignore patterns (a lot of developers have `CLAUDE.md` in their global ignore list, and you absolutely want this file tracked).

### 4. Run /setup-project

Open Claude Code from the companion repo root and type `/setup-project`. This:

1. Scans the codebase and asks you to confirm the target directory
2. Runs a deep analysis, reading configs, entry points, CSS, JS, the lot
3. Generates `.claude/` (agents, skills, commands, rules, settings) tailored to what it found
4. Generates `DOCS/` with architecture documentation
5. Creates `CLAUDE.md` and `README.md`

A few minutes later, you have a complete, project-specific Claude configuration. None of it touches the application repo.

I've written a separate post that goes deeper into what gets generated and how the configuration primitives work: [Creating Reusable Workflows for Claude Code](/blog/posts/creating-reusable-workflows-for-claude-code/). This post is about the structure and the reasoning; that one is about the internals.

### 5. Keeping It Current

Projects change, configuration drifts. `/realign-project` re-analyses the codebase, diffs against the existing config, and updates what's changed. I run it after significant structural changes: a major refactor, a new module, a shift in conventions. Takes a couple of minutes and keeps everything honest.

## What This Looks Like in Practice

Here's the actual structure of the claude companion repo I use for this site:

```
aaronmedina-dev.github.io-claude/       # Companion repo
├── .claude/
│   ├── settings.json
│   ├── agents/                         # 5 domain agents
│   ├── commands/                       # 5 slash commands
│   ├── skills/                         # 4 knowledge skills
│   └── rules/                          # 6 coding convention rules
├── DOCS/                               # 10 documentation files
├── CLAUDE.md
├── README.md
├── .gitignore
│
└── aaronmedina-dev.github.io/          # App repo (git-ignored)
    ├── .eleventy.js
    ├── index.html
    ├── blog/
    ├── cidr-calculator/
    ├── pert/
    ├── snake/
    ├── claude-code-leak/
    └── whatthepatch/
```

22 configuration files, 10 documentation files, all in the companion repo. The application repo is a GitHub Pages portfolio site with a blog, mini-tools, and doc sites. It has no idea Claude configuration exists. Every Claude Code session starts with full context about how the project works, and the app stays exactly as it was.

This setup isn't necessary for every project. For private repos where the team all uses Claude Code, committing `.claude/` directly to the project is simpler and there's nothing wrong with that. But if you're working with public repos, contributing to codebases you don't own, or you just prefer keeping your tooling separate from your code, a separate companion repo is a straightforward way to get there. Five minutes to set up, `/realign-project` to maintain, and the application repo never knows the difference.
