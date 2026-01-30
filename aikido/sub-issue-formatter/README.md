# Aikido Sub-Issue Formatter

A utility for parsing and reformatting security vulnerability output from Aikido security scanner into clean, markdown-compatible format.

## Purpose

When working with Aikido security findings, the raw output format can be verbose and difficult to use in issue trackers. This tool extracts the essential information and formats it for easy copy-paste into GitHub issues, Jira tickets, or other tracking systems.

## Features

- Parses Aikido security scanner output
- Extracts severity level, line numbers, file paths, and code snippets
- Handles multi-line code snippets
- Outputs clean markdown format
- One-click copy to clipboard

## Input Format

The tool expects Aikido output in this format:

```
Issue description

High
Line 42 in filename.js
code snippet here
View file
```

## Output Format

```markdown
**Issue 1 Line 42 path/to/filename.js**
code snippet here
```

## Usage

1. Paste Aikido security findings into the input textarea
2. Click "Process"
3. Copy the formatted output

## Live Demo

[https://aaronmedina-dev.github.io/aikido/sub-issue-formatter/](https://aaronmedina-dev.github.io/aikido/sub-issue-formatter/)
