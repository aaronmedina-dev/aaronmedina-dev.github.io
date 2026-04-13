---
title: "Creating Reusable Workflows for Claude Code Projects"
date: 2026-04-13
description: "A deep dive into Claude Code's configuration primitives — rules, agents, skills, commands — how they compose, and how /setup-project orchestrates them to generate a complete project configuration automatically."
tags: ["Claude", "AI", "Skills", "Productivity"]
readTime: "15 min read"
draft: true
---

In a previous post I covered how I structure my projects locally with Claude Code using the wrapper repo pattern. That post deliberately skipped over the internals -- what the `.claude/` directory actually contains, why each piece exists, and how `/setup-project` orchestrates everything. This post is the deep dive. It covers the five configuration primitives (rules, agents, skills, commands, settings), how they compose into something greater than the sum of their parts, and how workflow skills like `/setup-project` automate the entire setup process. If you haven't read the first post, [The Claude Companion Repo: How I Set Up Every New Project](/blog/posts/how-i-set-up-projects-with-claude-code/) covers the wrapper pattern and the five-minute setup workflow.

## The Five Primitives

Claude Code's `.claude/` directory has five categories of configuration. Each one handles a different concern, and understanding why they're separate is key to using them well. Rules handle conventions. Agents scope context. Skills encode knowledge. Commands create shortcuts. Settings gate permissions. None of them overlap, and each one is the right tool for its specific job.

## Rules: The Guardrails

Rules are Markdown files that apply automatically whenever you're working with files matching a glob pattern. You don't invoke them -- they just kick in.

Why they exist as a separate concept is worth thinking about. Conventions apply everywhere, regardless of which agent is running or what command triggered the work. Australian English should be enforced whether you're writing a blog post from scratch or editing one during an SEO review. Rules handle this by being always-on for matching files. You configure them once and stop thinking about them.

Here's the actual blog-posts rule from my project:

```markdown
# Glob: blog/posts/**/*.md

## Language
- Use Australian/British English spelling: colour, organisation, analyse, behaviour
- Avoid American spellings: color, organization, analyze, behavior

## Front Matter
- Date format: YYYY-MM-DD
- Tags: title case array (e.g. ["DevOps", "CI/CD"])
- readTime: format "X min read"
- Do not set layout or permalink -- these come from posts.json
```

The `Glob:` line at the top scopes it. When Claude touches a file matching `blog/posts/**/*.md`, this rule loads automatically. No configuration, no manual activation. It's the lowest-effort, highest-impact thing you can add to a project.

I have six rules covering blog posts, HTML pages, JavaScript, Eleventy config, tool directories, and doc sites. Each one captures conventions that would otherwise need re-explaining at the start of every relevant session. Before I had them, I'd periodically discover a post had been written with American spellings, or a new HTML page was missing canonical URLs. Rules are essentially a linter that Claude carries around in its head.

## Agents: The Domain Specialists

Agents are subagents with scoped context for specific parts of the codebase. When invoked, they get their own tools, context window, and domain knowledge.

The reason they exist comes down to token efficiency and focus. Different parts of a codebase need different context. Working on a blog post needs front matter schemas, Eleventy layout conventions, and spelling rules. Working on the CIDR calculator needs shared CSS patterns, IP address maths, and the tool directory structure. Loading everything everywhere wastes tokens and risks confusing one domain's conventions with another's.

Here are the five agents I have for my portfolio site:

| Agent | Domain | What It Knows |
|-------|--------|---------------|
| blog-agent | Blog system | Front matter, Eleventy layouts, Australian English, feeds |
| tools-agent | Mini-tools | CIDR, PERT, Aikido formatter, shared CSS/JS patterns |
| docs-site-agent | Doc sites | claude-code-leak, whatthepatch, sidebar layout |
| homepage-agent | Homepage | The 2058-line index.html, inline CSS/JS, GitHub API |
| infrastructure-agent | Build/deploy | .eleventy.js, GitHub Actions, shared assets, SEO |

The design decision I'd push for here: agents should map to domain areas, not tasks. The blog-agent handles everything blog-related -- creating, editing, styling, fixing. You don't need separate agents for authoring versus editing versus reviewing. One per domain keeps the configuration manageable and the context coherent.

Agents can also preload skills. The blog-agent has the blog-post-workflow skill available automatically, so it doesn't need to be told to load it. That's part of what makes the composition work.

## Skills: The Knowledge Base

Skills are preloaded knowledge and workflows. Each skill is a folder with a `SKILL.md` file containing instructions, examples, and domain knowledge. I wrote a whole post about building them -- the frontmatter format, progressive disclosure, the three loading levels -- so I won't repeat all of that here. The short version: skills are how you teach Claude something once and have it remember.

The reason skills exist as a separate concept from agents is that knowledge is reusable across domains. The design-system skill -- CSS custom properties, colour palette, component classes, typography conventions -- is needed by the tools-agent, the homepage-agent, AND the docs-site-agent. If that knowledge lived inside each agent definition, you'd be maintaining three copies. Define it once as a skill, let agents reference it.

The four skills in my project are:

- **blog-post-workflow** -- step-by-step workflow for creating a post: front matter schema, file naming, image conventions, tag consistency
- **tool-scaffold** -- template and checklist for creating a new mini-tool, including the asset loading order and page structure
- **eleventy-config** -- reference for how `.eleventy.js` works, what to update when adding content, the passthrough and ignores patterns
- **design-system** -- CSS custom properties, colour palette, typography, component classes, and visual conventions used across the site

Skills serve two purposes simultaneously. First, they're knowledge that agents load on demand -- progressive disclosure means the token cost is paid only when the knowledge is actually needed. Second, users can invoke them directly as slash commands. The same skill that the blog-agent loads automatically when creating a post can also be invoked by typing `/new-post` and getting the workflow interactively.

## Commands: The Entry Points

Commands are user-invocable prompt templates. Type `/new-post` and Claude follows the instructions. That's it.

They exist because typing one short command beats explaining the full context every time. The command file contains the setup: which agent to invoke, what context to establish, what to ask the user.

The five commands in my project:

| Command | What It Does |
|---------|-------------|
| `/new-post` | Creates a blog post with correct front matter |
| `/new-tool` | Scaffolds a new mini-tool directory |
| `/build` | Runs the Eleventy production build |
| `/serve` | Starts the local dev server |
| `/review-seo` | Audits SEO elements across all pages |

The distinction worth holding onto: commands are "do this now" (action-oriented). Skills are "here's how" (knowledge-oriented). `/new-post` is a command that invokes the blog-agent, which loads the blog-post-workflow skill. The command is the entry point. The skill is the expertise.

## Settings: The Permissions Layer

Settings control what Claude can do without asking. Mine are simple:

```json
{
  "permissions": {
    "allow": ["Read(*)", "Glob(*)", "Grep(*)"],
    "ask": ["Edit(*)", "Write(*)", "Bash(npm *)"]
  }
}
```

Reading is always allowed. Editing and writing require confirmation. Running npm commands requires confirmation. The principle is: broad exploration is safe, destructive operations get a checkpoint. For a codebase with a 2058-line `index.html` that took real effort to build, you want that gate on writes.

## How They Compose

This is where it gets interesting. The primitives are useful individually, but they're more useful together because they're decoupled. A change to one doesn't require changes to the others.

When I type `/new-post`, here's what actually happens:

1. The **command** (`commands/new-post.md`) triggers, tells Claude to gather requirements and invoke the blog-agent
2. The **agent** (`agents/blog-agent.md`) is invoked with scoped blog context -- it knows the Eleventy structure, the image conventions, the existing tags
3. The agent loads the **skill** (`skills/blog-post-workflow/SKILL.md`) for the step-by-step workflow
4. When Claude creates the `.md` file, the **rule** (`rules/blog-posts.md`) auto-applies, enforcing Australian English and front matter format
5. **Settings** gate the file write with a confirmation prompt

As a flow:

```
/new-post (command)
  → blog-agent (agent)
    → blog-post-workflow (skill: loaded knowledge)
    → blog-posts rule (auto-applied on .md creation)
    → settings.json (permission gate on Write)
```

Each primitive handles one concern. When you update the Australian English rules, you update one file and it applies everywhere -- regardless of which command or agent triggered the work. When you add a new tag to the allowed list in the blog-post-workflow skill, it's available to every agent that loads that skill. Nothing needs to be replicated.

The composition isn't clever. It's just good separation of concerns applied to configuration files.

## The Workflow Pattern: /setup-project

Now the most powerful composition -- a workflow skill that orchestrates multiple agents to generate the entire `.claude/` directory automatically.

`/setup-project` is the skill that was used to set up my own project configuration. One command, and it produces `.claude/` (with agents, skills, commands, rules, and settings), `DOCS/`, `CLAUDE.md`, and `README.md` -- all tailored to the actual codebase, not a generic template.

### How It Works

**Step 1: Discovery**

The workflow examines the codebase structure and asks the user to confirm the target application directory. It doesn't assume which subdirectory is the app code -- it asks. This matters because in the wrapper pattern, you might have multiple repos cloned inside one wrapper.

**Step 2: Deep Analysis**

This is where the heavy lifting happens. The workflow invokes a **project-analyser-agent** -- a specialised subagent that reads every key file: configs, entry points, routes, CSS, JS, all of it. It produces a structured analysis report covering architecture, patterns, domain areas, and integration points.

This step takes a few minutes, because it's doing genuine analysis. It's not guessing at your architecture from the file tree. It's reading your Eleventy config to understand how templates are processed, reading your CSS to understand the design system, reading your blog posts to understand the content conventions. The quality of everything that follows depends on the quality of this analysis.

**Step 3: Parallel Generation**

Using the analysis report, two agents run in parallel:

- **config-generator-agent** creates `.claude/` (settings, agents, skills, commands, rules) plus `CLAUDE.md`
- **docs-generator-agent** creates `DOCS/` with architecture docs, domain docs, and integration docs

Running them in parallel cuts total time roughly in half. They're independent -- the config generator doesn't need the docs, and the docs generator doesn't need the config. Parallelise where you can.

**Step 4: README + Verification**

Generates `README.md` with the complete folder structure. Then verifies every expected file was created and isn't empty. If something is missing or zero-bytes, it flags it before finishing.

The design principle here is the same one running through the whole system: the workflow doesn't contain knowledge of how to analyse codebases or how to generate agents. That knowledge lives in the specialised agents. The workflow just coordinates them -- sequence, parallelisation, error handling. Same separation of concerns, different scale.

## /realign-project: Keeping It Current

Projects change. You add a new tool, refactor the blog layout, introduce a new directory convention. The configuration drifts.

`/realign-project` is the companion workflow:

1. Re-analyses the current codebase
2. Diffs against the existing configuration
3. Updates only what's changed

I run it after any significant structural change. Think of it like running a linter -- it's not something you do once at setup. It's something you run periodically to keep the configuration honest. After a major refactor where three new mini-tools were added, `/realign-project` picked up the new directories, updated the tools-agent with their patterns, and added the relevant passthrough entries to the Eleventy config notes. Took a couple of minutes.

## Building Your Own Workflows

The workflow pattern isn't limited to setup and alignment. Any sufficiently complex task with sequencing dependencies and multiple agents can be a workflow.

A workflow is just a skill with orchestration steps. The pattern:

1. Define the steps in a `SKILL.md`
2. Each step can invoke agents via the Agent tool, run bash commands, or ask the user
3. Steps that are independent can run in parallel
4. The workflow coordinates; agents hold the knowledge

Here's a simple skeleton:

```markdown
---
name: my-workflow
description: >
  Orchestrates X by running analysis, then generating output.
  Use when user asks to "set up X" or "configure X".
---

# My Workflow

## Step 1: Gather Requirements
Ask the user for...

## Step 2: Analyse
Use the Agent tool to invoke the analyser-agent with the confirmed target...

## Step 3: Generate
Use the Agent tool to invoke the generator-agent with the analysis report...

## Step 4: Verify
Check that all expected files were created and are non-empty...
```

The key call-out: the workflow `SKILL.md` stays thin. It describes sequencing and coordination. The agents it invokes carry the actual expertise. If you find yourself writing deep domain knowledge directly into a workflow, that knowledge probably belongs in a specialised agent or skill that the workflow can reference.

The real value isn't in any single primitive -- it's in the composition. Rules handle conventions silently. Agents scope context to relevant domains. Skills encode knowledge once and share it. Commands give quick access to common tasks. Workflows tie everything together and automate what would otherwise require a lot of manual coordination. Start with rules (easiest win, no setup beyond writing a Markdown file), add agents when you have distinct domains, and build up from there. Every piece you add makes every session more productive, and unlike most configuration, this one pays dividends every day you use Claude Code.
