import subprocess
import math
import os

FRAME_COUNT = 40
FRAME_DIR = "/tmp/gif-frames"
SVG_TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 400" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="780" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0a0f1a"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="glowBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="glowGreen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="glowAmber" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
    </linearGradient>
    <symbol id="claude-icon" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3.5" fill="#D97757"/>
      <ellipse cx="12" cy="3.5" rx="1.8" ry="2.5" fill="#D97757" opacity="0.9"/>
      <ellipse cx="12" cy="20.5" rx="1.8" ry="2.5" fill="#D97757" opacity="0.9"/>
      <ellipse cx="3.5" cy="12" rx="2.5" ry="1.8" fill="#D97757" opacity="0.9"/>
      <ellipse cx="20.5" cy="12" rx="2.5" ry="1.8" fill="#D97757" opacity="0.9"/>
      <ellipse cx="5.8" cy="5.8" rx="1.8" ry="2.2" transform="rotate(-45 5.8 5.8)" fill="#D97757" opacity="0.7"/>
      <ellipse cx="18.2" cy="18.2" rx="1.8" ry="2.2" transform="rotate(-45 18.2 18.2)" fill="#D97757" opacity="0.7"/>
      <ellipse cx="18.2" cy="5.8" rx="1.8" ry="2.2" transform="rotate(45 18.2 5.8)" fill="#D97757" opacity="0.7"/>
      <ellipse cx="5.8" cy="18.2" rx="1.8" ry="2.2" transform="rotate(45 5.8 18.2)" fill="#D97757" opacity="0.7"/>
    </symbol>
  </defs>

  <rect width="780" height="400" fill="url(#bg)"/>

  <g opacity="0.04">
    <line x1="0" y1="40" x2="780" y2="40" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="0" y1="80" x2="780" y2="80" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="0" y1="120" x2="780" y2="120" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="0" y1="160" x2="780" y2="160" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="0" y1="200" x2="780" y2="200" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="0" y1="240" x2="780" y2="240" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="0" y1="280" x2="780" y2="280" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="0" y1="320" x2="780" y2="320" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="0" y1="360" x2="780" y2="360" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="40" y1="0" x2="40" y2="400" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="130" y1="0" x2="130" y2="400" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="220" y1="0" x2="220" y2="400" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="310" y1="0" x2="310" y2="400" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="390" y1="0" x2="390" y2="400" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="470" y1="0" x2="470" y2="400" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="560" y1="0" x2="560" y2="400" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="650" y1="0" x2="650" y2="400" stroke="#94a3b8" stroke-width="0.5"/>
    <line x1="740" y1="0" x2="740" y2="400" stroke="#94a3b8" stroke-width="0.5"/>
  </g>

  <ellipse cx="170" cy="210" rx="90" ry="60" fill="url(#glowBlue)"/>
  <ellipse cx="390" cy="210" rx="90" ry="60" fill="url(#glowGreen)"/>
  <ellipse cx="610" cy="210" rx="90" ry="60" fill="url(#glowAmber)"/>

  <!-- Central .git repo node -->
  <rect x="325" y="300" width="130" height="52" rx="10" fill="#0f172a" stroke="#6366f1" stroke-width="2"/>
  <rect x="343" y="314" width="13" height="10" rx="2" fill="#6366f1" fill-opacity="0.6"/>
  <rect x="343" y="312" width="7" height="3" rx="1" fill="#6366f1" fill-opacity="0.6"/>
  <text x="362" y="323" fill="#a5b4fc" font-family="ui-monospace, monospace" font-size="12" font-weight="600">my-repo/</text>
  <text x="390" y="342" fill="#6366f1" font-family="ui-monospace, monospace" font-size="10" text-anchor="middle">main</text>

  <!-- Branch lines -->
  <path d="M170 262 Q170 290 340 315" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" opacity="0.4" stroke-dasharray="4,3"/>
  <path d="M390 262 L390 300" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" opacity="0.4" stroke-dasharray="4,3"/>
  <path d="M610 262 Q610 290 440 315" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" opacity="0.4" stroke-dasharray="4,3"/>

  <!-- Worktree 1 -->
  <rect x="90" y="170" width="160" height="92" rx="12" fill="#0f172a" stroke="#3b82f6" stroke-width="1.5"/>
  <rect x="90" y="250" width="160" height="4" rx="0 0 2 2" fill="#3b82f6" fill-opacity="0.3"/>
  <rect x="90" y="250" width="{w1}" height="4" rx="0 0 2 2" fill="#3b82f6" fill-opacity="0.6"/>
  <use href="#claude-icon" x="108" y="182" width="28" height="28"/>
  <text x="145" y="200" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="13" font-weight="600">Claude</text>
  <circle cx="254" cy="127" r="4" fill="#3b82f6" opacity="{p1}"/>
  <circle cx="254" cy="192" r="2" fill="#3b82f6"/>
  <rect x="108" y="218" width="124" height="24" rx="5" fill="#3b82f6" fill-opacity="0.1" stroke="#3b82f6" stroke-width="0.5" stroke-opacity="0.3"/>
  <text x="170" y="234" fill="#60a5fa" font-family="ui-monospace, monospace" font-size="11" text-anchor="middle">Branch 1</text>

  <!-- Worktree 2 -->
  <rect x="310" y="170" width="160" height="92" rx="12" fill="#0f172a" stroke="#22c55e" stroke-width="1.5"/>
  <rect x="310" y="250" width="160" height="4" rx="0 0 2 2" fill="#22c55e" fill-opacity="0.3"/>
  <rect x="310" y="250" width="{w2}" height="4" rx="0 0 2 2" fill="#22c55e" fill-opacity="0.6"/>
  <use href="#claude-icon" x="328" y="182" width="28" height="28"/>
  <text x="365" y="200" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="13" font-weight="600">Claude</text>
  <circle cx="444" cy="192" r="2" fill="#22c55e"/>
  <rect x="328" y="218" width="124" height="24" rx="5" fill="#22c55e" fill-opacity="0.1" stroke="#22c55e" stroke-width="0.5" stroke-opacity="0.3"/>
  <text x="390" y="234" fill="#4ade80" font-family="ui-monospace, monospace" font-size="11" text-anchor="middle">Branch 2</text>

  <!-- Worktree 3 -->
  <rect x="530" y="170" width="160" height="92" rx="12" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5"/>
  <rect x="530" y="250" width="160" height="4" rx="0 0 2 2" fill="#f59e0b" fill-opacity="0.3"/>
  <rect x="530" y="250" width="{w3}" height="4" rx="0 0 2 2" fill="#f59e0b" fill-opacity="0.6"/>
  <use href="#claude-icon" x="548" y="182" width="28" height="28"/>
  <text x="585" y="200" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="13" font-weight="600">Claude</text>
  <circle cx="634" cy="192" r="2" fill="#f59e0b"/>
  <rect x="548" y="218" width="124" height="24" rx="5" fill="#f59e0b" fill-opacity="0.1" stroke="#f59e0b" stroke-width="0.5" stroke-opacity="0.3"/>
  <text x="610" y="234" fill="#fbbf24" font-family="ui-monospace, monospace" font-size="11" text-anchor="middle">Branch 3</text>

  <!-- Title -->
  <text x="390" y="68" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" text-anchor="middle" letter-spacing="-0.5">Git Worktrees for AI Agents</text>
  <text x="390" y="100" fill="#64748b" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle">Parallel branches, isolated sandboxes, one shared repository</text>

  <g opacity="0.2">
    <path d="M254 210 L306 210" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
    <path d="M474 210 L526 210" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
  </g>

  <rect x="290" y="372" width="200" height="2" rx="1" fill="#374151" opacity="0.5"/>
</svg>"""

# Generate frames with different progress bar widths
for i in range(FRAME_COUNT):
    t = i / FRAME_COUNT
    # Each bar has a different speed/phase
    w1 = 40 + 120 * (0.5 + 0.5 * math.sin(2 * math.pi * t * 1.0))
    w2 = 40 + 120 * (0.5 + 0.5 * math.sin(2 * math.pi * t * 1.4 + 1.2))
    w3 = 40 + 120 * (0.5 + 0.5 * math.sin(2 * math.pi * t * 0.8 + 2.5))
    p1 = 0.3 + 0.5 * (0.5 + 0.5 * math.sin(2 * math.pi * t * 2.0))

    svg = SVG_TEMPLATE.format(
        w1=f"{w1:.1f}",
        w2=f"{w2:.1f}",
        w3=f"{w3:.1f}",
        p1=f"{p1:.2f}"
    )

    svg_path = os.path.join(FRAME_DIR, f"frame_{i:03d}.svg")
    png_path = os.path.join(FRAME_DIR, f"frame_{i:03d}.png")

    with open(svg_path, "w") as f:
        f.write(svg)

    subprocess.run([
        "rsvg-convert",
        "-w", "780",
        "-h", "400",
        svg_path,
        "-o", png_path
    ], check=True)

print(f"Generated {FRAME_COUNT} PNG frames")

# Combine into GIF using Pillow
from PIL import Image

frames = []
for i in range(FRAME_COUNT):
    png_path = os.path.join(FRAME_DIR, f"frame_{i:03d}.png")
    img = Image.open(png_path).convert("RGBA")
    # Convert to palette mode for smaller GIF
    rgb = Image.new("RGB", img.size, (10, 15, 26))
    rgb.paste(img, mask=img.split()[3])
    frames.append(rgb)

output_path = "/Users/aaron.medina@aligent.com.au/Desktop/workspace/PRIVATE-REPOS/aaronmedina-dev.github.io/blog/images/git-worktrees-hero.gif"
frames[0].save(
    output_path,
    save_all=True,
    append_images=frames[1:],
    duration=100,  # 100ms per frame = 4 seconds total loop
    loop=0,
    optimize=True
)

file_size = os.path.getsize(output_path) / 1024
print(f"GIF saved to {output_path} ({file_size:.0f} KB)")
