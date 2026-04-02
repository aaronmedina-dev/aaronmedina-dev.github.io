---
title: "🛡️‍💥 23 Vulnerabilities in Claude Code's Leaked Source"
date: 2026-04-02
description: "We audited Claude Code's leaked source for security vulnerabilities. 23 verified findings, 7 critical. The #1 attack vector? A malicious git repository."
tags: ["Claude", "AI", "Security", "Vulnerabilities"]
readTime: "10 min read"
image: "/blog/images/claude-code-security-hero.svg"
ogImage: "/blog/images/claude-code-security-hero.png"
imageAlt: "Claude Code Security Vulnerabilities Audit"
---

Following our [reverse-engineering of Claude Code's leaked source](/blog/posts/reverse-engineering-claude-code-leaked-source/) for hacks and optimisations, we turned to the security side. We audited the full 1,900-file TypeScript codebase for vulnerabilities, attack surfaces, and exploitable gaps.

The results: **23 verified vulnerabilities, 7 rated critical.**

<div style="background: var(--bg-secondary, #111827); border: 1px solid var(--border, #1f2937); border-radius: 8px; padding: 24px; margin: 24px 0; font-family: 'Fira Code', 'SF Mono', monospace; font-size: 0.85rem; line-height: 1.8;">
  <div style="display: grid; grid-template-columns: 140px 1fr; gap: 4px 16px;">
    <span style="color: #9ca3af;">Source</span>
    <span style="color: #f3f4f6;">Claude Code npm package (leaked 2026-03-31)</span>
    <span style="color: #9ca3af;">Codebase</span>
    <span style="color: #f3f4f6;">~1,900 TypeScript files</span>
    <span style="color: #9ca3af;">Findings</span>
    <span style="color: #f3f4f6;">23 verified vulnerabilities</span>
    <span style="color: #9ca3af;">Severity</span>
    <span>
      <span style="background: rgba(239,68,68,0.15); color: #ef4444; padding: 1px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">7 CRITICAL</span>
      <span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 1px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">10 HIGH</span>
      <span style="background: rgba(59,130,246,0.15); color: #3b82f6; padding: 1px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">5 MEDIUM</span>
      <span style="background: rgba(34,197,94,0.15); color: #22c55e; padding: 1px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">1 LOW</span>
    </span>
    <span style="color: #9ca3af;">#1 Vector</span>
    <span style="color: #ef4444; font-weight: 600;">Malicious git repositories</span>
    <span style="color: #9ca3af;">Full audit</span>
    <span><a href="/claude-code-leak/security.html" style="color: #3b82f6;">claude-code-leak/security.html</a></span>
  </div>
</div>

### Key Takeaways

- **The primary attack vector is malicious repositories.** A repo with crafted `.claude/` files can execute arbitrary commands, inject system prompts, configure attacker-controlled MCP servers, and read arbitrary files -- all triggered automatically on project open.
- **Seven critical vulnerabilities allow arbitrary code execution or data exfiltration** without user approval in some cases.
- **Shell security has specific bypass vectors** including a 50-subcommand analysis cap and sed delimiter tricks.
- **Credentials are stored in plaintext** on Linux and Windows (`~/.claude/.credentials.json`).
- **No symlink resolution or critical path protection** in file write operations.

---

## Attack Priority Matrix

All 23 verified vulnerabilities ranked by severity. Each links to the detailed analysis in the [full security audit](/claude-code-leak/security.html).

<table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
  <thead>
    <tr style="border-bottom: 2px solid #1f2937;">
      <th style="padding: 10px 12px; text-align: left; color: #f3f4f6;">#</th>
      <th style="padding: 10px 12px; text-align: left; color: #f3f4f6;">Vulnerability</th>
      <th style="padding: 10px 12px; text-align: left; color: #f3f4f6;">Severity</th>
      <th style="padding: 10px 12px; text-align: left; color: #f3f4f6;">Requires</th>
      <th style="padding: 10px 12px; text-align: left; color: #f3f4f6;">Exploitability</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">1</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-1">CLAUDE.md Prompt Injection</a></td><td style="padding: 10px 12px;"><span style="background: rgba(239,68,68,0.15); color: #ef4444; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">CRITICAL</span></td><td style="padding: 10px 12px; color: #9ca3af;">Malicious repo clone</td><td style="padding: 10px 12px; color: #9ca3af;">Trivial</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">2</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-2">Memory File Injection</a></td><td style="padding: 10px 12px;"><span style="background: rgba(239,68,68,0.15); color: #ef4444; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">CRITICAL</span></td><td style="padding: 10px 12px; color: #9ca3af;">Malicious repo clone</td><td style="padding: 10px 12px; color: #9ca3af;">Trivial</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">3</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-3">Custom Agent Injection</a></td><td style="padding: 10px 12px;"><span style="background: rgba(239,68,68,0.15); color: #ef4444; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">CRITICAL</span></td><td style="padding: 10px 12px; color: #9ca3af;">Malicious repo clone</td><td style="padding: 10px 12px; color: #9ca3af;">Trivial</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">4</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-4">Skill File Injection</a></td><td style="padding: 10px 12px;"><span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">HIGH</span></td><td style="padding: 10px 12px; color: #9ca3af;">Malicious repo clone</td><td style="padding: 10px 12px; color: #9ca3af;">Trivial</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">5</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-5">CLAUDE.md @include Path Traversal</a></td><td style="padding: 10px 12px;"><span style="background: rgba(239,68,68,0.15); color: #ef4444; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">CRITICAL</span></td><td style="padding: 10px 12px; color: #9ca3af;">Malicious repo clone</td><td style="padding: 10px 12px; color: #9ca3af;">Trivial</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">6</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-6">Hook Command Injection</a></td><td style="padding: 10px 12px;"><span style="background: rgba(239,68,68,0.15); color: #ef4444; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">CRITICAL</span></td><td style="padding: 10px 12px; color: #9ca3af;">Malicious repo clone</td><td style="padding: 10px 12px; color: #9ca3af;">Trivial</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">7</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-7">Subcommand Limit Bypass (&gt;50)</a></td><td style="padding: 10px 12px;"><span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">HIGH</span></td><td style="padding: 10px 12px; color: #9ca3af;">Prompt injection</td><td style="padding: 10px 12px; color: #9ca3af;">Moderate</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">8</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-8">Sandbox Exclusion via dangerouslyDisableSandbox</a></td><td style="padding: 10px 12px;"><span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">HIGH</span></td><td style="padding: 10px 12px; color: #9ca3af;">Model prompt</td><td style="padding: 10px 12px; color: #9ca3af;">Moderate</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">9</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-9">Sed Non-Slash Delimiter Bypass</a></td><td style="padding: 10px 12px;"><span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">HIGH</span></td><td style="padding: 10px 12px; color: #9ca3af;">Model prompt</td><td style="padding: 10px 12px; color: #9ca3af;">Easy</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">10</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-10">MCP Tool Result Injection</a></td><td style="padding: 10px 12px;"><span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">HIGH</span></td><td style="padding: 10px 12px; color: #9ca3af;">Malicious MCP server</td><td style="padding: 10px 12px; color: #9ca3af;">Easy</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">11</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-11">MCP Environment Variable Leakage</a></td><td style="padding: 10px 12px;"><span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">HIGH</span></td><td style="padding: 10px 12px; color: #9ca3af;">Malicious repo clone</td><td style="padding: 10px 12px; color: #9ca3af;">Easy</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">12</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-12">JWT Signature Not Verified</a></td><td style="padding: 10px 12px;"><span style="background: rgba(239,68,68,0.15); color: #ef4444; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">CRITICAL</span></td><td style="padding: 10px 12px; color: #9ca3af;">Network position</td><td style="padding: 10px 12px; color: #9ca3af;">Medium</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">13</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-13">Bridge Message Type Guard</a></td><td style="padding: 10px 12px;"><span style="background: rgba(239,68,68,0.15); color: #ef4444; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">CRITICAL</span></td><td style="padding: 10px 12px; color: #9ca3af;">MitM or compromised server</td><td style="padding: 10px 12px; color: #9ca3af;">Easy</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">14</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-14">Swarm Permission Forgery</a></td><td style="padding: 10px 12px;"><span style="background: rgba(59,130,246,0.15); color: #3b82f6; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">MEDIUM</span></td><td style="padding: 10px 12px; color: #9ca3af;">Swarm agent context</td><td style="padding: 10px 12px; color: #9ca3af;">Easy</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">15</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-15">Project Settings Injection</a></td><td style="padding: 10px 12px;"><span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">HIGH</span></td><td style="padding: 10px 12px; color: #9ca3af;">Malicious repo clone</td><td style="padding: 10px 12px; color: #9ca3af;">Trivial</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">16</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-16">MCP Server Config Injection</a></td><td style="padding: 10px 12px;"><span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">HIGH</span></td><td style="padding: 10px 12px; color: #9ca3af;">Malicious repo clone</td><td style="padding: 10px 12px; color: #9ca3af;">Trivial</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">17</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-17">Symlink Following in File Writes</a></td><td style="padding: 10px 12px;"><span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">HIGH</span></td><td style="padding: 10px 12px; color: #9ca3af;">Filesystem preparation</td><td style="padding: 10px 12px; color: #9ca3af;">Medium</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">18</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-18">WebFetch SSRF</a></td><td style="padding: 10px 12px;"><span style="background: rgba(59,130,246,0.15); color: #3b82f6; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">MEDIUM</span></td><td style="padding: 10px 12px; color: #9ca3af;">Prompt injection</td><td style="padding: 10px 12px; color: #9ca3af;">Easy</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">19</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-19">Plaintext Credentials (Linux/Windows)</a></td><td style="padding: 10px 12px;"><span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">HIGH</span></td><td style="padding: 10px 12px; color: #9ca3af;">Local user access</td><td style="padding: 10px 12px; color: #9ca3af;">Trivial</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">20</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-20">No Critical Path Protection</a></td><td style="padding: 10px 12px;"><span style="background: rgba(59,130,246,0.15); color: #3b82f6; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">MEDIUM</span></td><td style="padding: 10px 12px; color: #9ca3af;">Bypass mode</td><td style="padding: 10px 12px; color: #9ca3af;">Easy</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">21</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-21">Fork Context Data Leakage</a></td><td style="padding: 10px 12px;"><span style="background: rgba(59,130,246,0.15); color: #3b82f6; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">MEDIUM</span></td><td style="padding: 10px 12px; color: #9ca3af;">Normal usage</td><td style="padding: 10px 12px; color: #9ca3af;">Easy</td></tr>
    <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 10px 12px;">22</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-22">DNS Exfiltration (no detection)</a></td><td style="padding: 10px 12px;"><span style="background: rgba(59,130,246,0.15); color: #3b82f6; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">MEDIUM</span></td><td style="padding: 10px 12px; color: #9ca3af;">Prompt injection</td><td style="padding: 10px 12px; color: #9ca3af;"><strong>No detection exists</strong></td></tr>
    <tr><td style="padding: 10px 12px;">23</td><td style="padding: 10px 12px;"><a href="/claude-code-leak/security.html#vuln-23">Context Window Exhaustion DoS</a></td><td style="padding: 10px 12px;"><span style="background: rgba(34,197,94,0.15); color: #22c55e; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">LOW</span></td><td style="padding: 10px 12px; color: #9ca3af;">Normal usage</td><td style="padding: 10px 12px; color: #9ca3af;">Easy but low impact</td></tr>
  </tbody>
</table>

The most trivially exploitable findings (1-5, 8, 13-15) all share the same vector: **a malicious git repository with crafted `.claude/` files**. A developer clones the repo, runs `claude`, and the attack chain fires automatically.

---

## Full Security Audit

This post covers the highlights. The complete analysis documents all 23 findings with severity ratings, affected source files, exploit code, and a sortable attack priority matrix.

<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08)); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center;">
  <p style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; color: #ef4444; margin-bottom: 8px; font-weight: 600;">Full Security Audit</p>
  <p style="font-size: 1.5rem; font-weight: 700; color: #f3f4f6; margin-bottom: 12px;">23 Verified Vulnerabilities</p>
  <p style="color: #9ca3af; margin-bottom: 24px; max-width: 500px; margin-left: auto; margin-right: auto;">Complete attack surface analysis with severity ratings, exploit code, and an attack priority matrix.</p>
  <a href="/claude-code-leak/security.html" style="display: inline-block; background: #ef4444; color: white; padding: 12px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 0.95rem;">View the Full Security Audit</a>
</div>

The source is [on GitHub](https://github.com/aaronmedina-dev/claude-code) if you want to verify these findings yourself. See also our [hacks and optimisations post](/blog/posts/reverse-engineering-claude-code-leaked-source/) for the non-security side of the analysis.
