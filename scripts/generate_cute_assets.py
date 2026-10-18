import os
import subprocess

assets_dir = os.path.abspath("game/assets")
os.makedirs(assets_dir, exist_ok=True)

# 1. reward_churu.svg (Cute Churu Tube with cat paw & sparkles)
churu_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="churuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff6b8b"/>
      <stop offset="50%" stop-color="#ff85a2"/>
      <stop offset="100%" stop-color="#ff477e"/>
    </linearGradient>
    <linearGradient id="creamyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff8f0"/>
      <stop offset="100%" stop-color="#ffe3cc"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff176"/>
      <stop offset="100%" stop-color="#fbc02d"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#ff4081" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Sparkles -->
  <g fill="#ffd700">
    <path d="M 45 40 Q 55 40 55 30 Q 55 40 65 40 Q 55 40 55 50 Q 55 40 45 40 Z"/>
    <path d="M 150 145 Q 158 145 158 137 Q 158 145 166 145 Q 158 145 158 153 Q 158 145 150 145 Z"/>
    <circle cx="160" cy="55" r="4" fill="#ffeb3b"/>
    <circle cx="35" cy="130" r="3.5" fill="#ffeb3b"/>
  </g>

  <!-- Churu Tube Body (Rotated 40deg) -->
  <g transform="translate(100, 105) rotate(-35) translate(-100, -100)" filter="url(#glow)">
    <!-- Base Tube -->
    <rect x="74" y="42" width="52" height="116" rx="22" fill="url(#churuGrad)" stroke="#ffffff" stroke-width="3"/>
    
    <!-- White Top Seal Line -->
    <path d="M 74 54 Q 100 58 126 54" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.8"/>
    <line x1="84" y1="46" x2="116" y2="46" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>

    <!-- Cream Center Label Wave -->
    <path d="M 74 72 Q 100 80 126 72 L 126 122 Q 100 114 74 122 Z" fill="url(#creamyGrad)"/>
    
    <!-- Gold Ribbon on Tube -->
    <rect x="74" y="93" width="52" height="6" fill="url(#goldGrad)" opacity="0.9"/>

    <!-- Cute Paw Print on Cream Center -->
    <g transform="translate(100, 97)" fill="#ff4081">
      <!-- Main Pad -->
      <ellipse cx="0" cy="3" rx="8" ry="6.5"/>
      <!-- Toe Beans -->
      <ellipse cx="-7.5" cy="-6" rx="3.5" ry="4.5" transform="rotate(-15, -7.5, -6)"/>
      <ellipse cx="-2.5" cy="-8.5" rx="3.5" ry="4.5"/>
      <ellipse cx="3.5" cy="-8.5" rx="3.5" ry="4.5"/>
      <ellipse cx="8" cy="-6" rx="3.5" ry="4.5" transform="rotate(15, 8, -6)"/>
    </g>

    <!-- Shiny Tube Gloss Highlight -->
    <path d="M 78 48 Q 80 100 80 148" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" opacity="0.55"/>

    <!-- Delicious Puree Treat Drop at Tip -->
    <g transform="translate(100, 36)">
      <path d="M 0 -14 C 12 -14 16 2 0 10 C -16 2 -12 -14 0 -14 Z" fill="#ffab91" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="-3" cy="-4" r="2.5" fill="#ffffff" opacity="0.75"/>
    </g>
  </g>
</svg>
"""

# 2. reward_ticket.svg (Golden Cat Gacha Ticket)
ticket_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="ticketGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff59d"/>
      <stop offset="35%" stop-color="#fdd835"/>
      <stop offset="80%" stop-color="#f57f17"/>
      <stop offset="100%" stop-color="#e65100"/>
    </linearGradient>
    <linearGradient id="pawPink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff80ab"/>
      <stop offset="100%" stop-color="#f50057"/>
    </linearGradient>
    <filter id="ticketGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#f57f17" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Sparkles -->
  <g fill="#fff59d">
    <path d="M 30 50 Q 40 50 40 40 Q 40 50 50 50 Q 40 50 40 60 Q 40 50 30 50 Z"/>
    <path d="M 165 140 Q 173 140 173 132 Q 173 140 181 140 Q 173 140 173 148 Q 173 140 165 140 Z"/>
    <circle cx="168" cy="45" r="4" fill="#ffffff"/>
    <circle cx="28" cy="145" r="3.5" fill="#ffffff"/>
  </g>

  <!-- Rotated Ticket -->
  <g transform="translate(100, 100) rotate(-12) translate(-100, -100)" filter="url(#ticketGlow)">
    <!-- Ticket Body with cutouts -->
    <path d="M 36 60 C 36 50 46 50 56 50 L 144 50 C 154 50 164 50 164 60 L 164 86 C 154 86 154 114 164 114 L 164 140 C 164 150 154 150 144 150 L 56 150 C 46 150 36 150 36 140 L 36 114 C 46 114 46 86 36 86 Z"
          fill="url(#ticketGold)" stroke="#ffffff" stroke-width="3.5"/>

    <!-- Inner Dashed Border -->
    <path d="M 44 60 L 156 60 L 156 86 L 156 114 L 156 140 L 44 140 Z"
          fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-dasharray="5,4"/>

    <!-- Perforation Stub Line -->
    <line x1="72" y1="52" x2="72" y2="148" stroke="#f57f17" stroke-width="2.5" stroke-dasharray="4,4" opacity="0.8"/>

    <!-- Left Stub Star -->
    <g transform="translate(54, 100)" fill="#ffffff">
      <path d="M 0 -11 L 3 -3 L 11 0 L 3 3 L 0 11 L -3 3 L -11 0 L -3 -3 Z"/>
    </g>

    <!-- Main Emblem: Paw Badge -->
    <circle cx="118" cy="95" r="26" fill="#ffffff" opacity="0.95"/>
    <g transform="translate(118, 97)" fill="url(#pawPink)">
      <ellipse cx="0" cy="3.5" rx="10" ry="8"/>
      <ellipse cx="-9.5" cy="-7.5" rx="4.5" ry="5.5" transform="rotate(-15, -9.5, -7.5)"/>
      <ellipse cx="-3.2" cy="-10.5" rx="4.5" ry="5.5"/>
      <ellipse cx="4.2" cy="-10.5" rx="4.5" ry="5.5"/>
      <ellipse cx="10" cy="-7.5" rx="4.5" ry="5.5" transform="rotate(15, 10, -7.5)"/>
    </g>

    <!-- Ribbon Label "LUCKY" -->
    <g transform="translate(118, 130)">
      <rect x="-30" y="-8" width="60" height="15" rx="7.5" fill="#d81b60" stroke="#ffffff" stroke-width="1.5"/>
      <text x="0" y="3" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="9" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">GACHA</text>
    </g>

    <!-- Gloss Highlight Sweep -->
    <path d="M 46 54 L 120 54 L 80 146 L 46 146 Z" fill="url(#ticketGold)" opacity="0.25"/>
  </g>
</svg>
"""

# 3. cat_paw_heart.svg (Glossy Gummy Cat Paw Heart)
heart_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="heartPink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff80ab"/>
      <stop offset="45%" stop-color="#ff4081"/>
      <stop offset="100%" stop-color="#c2185b"/>
    </linearGradient>
    <linearGradient id="beanLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ffc1e3"/>
    </linearGradient>
    <filter id="heartGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="#e91e63" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Big Heart Base with Paw Silhouetted -->
  <g filter="url(#heartGlow)">
    <path d="M 100 162 C 50 125 24 95 24 64 C 24 38 44 22 70 22 C 86 22 95 30 100 37 C 105 30 114 22 130 22 C 156 22 176 38 176 64 C 176 95 150 125 100 162 Z"
          fill="url(#heartPink)" stroke="#ffffff" stroke-width="4.5"/>

    <!-- Embossed Cat Paw Pad in Center of Heart -->
    <g transform="translate(100, 96)">
      <!-- Main Palm Pad -->
      <ellipse cx="0" cy="8" rx="22" ry="17" fill="url(#beanLight)"/>
      <!-- Top Center Dip in Palm -->
      <path d="M -10 1 Q 0 7 10 1 Q 0 -2 -10 1 Z" fill="url(#heartPink)" opacity="0.3"/>
      <!-- 4 Cute Toe Beans -->
      <ellipse cx="-23" cy="-14" rx="9" ry="12" fill="url(#beanLight)" transform="rotate(-25, -23, -14)"/>
      <ellipse cx="-8" cy="-22" rx="9" ry="12.5" fill="url(#beanLight)" transform="rotate(-8, -8, -22)"/>
      <ellipse cx="8" cy="-22" rx="9" ry="12.5" fill="url(#beanLight)" transform="rotate(8, 8, -22)"/>
      <ellipse cx="23" cy="-14" rx="9" ry="12" fill="url(#beanLight)" transform="rotate(25, 23, -14)"/>
    </g>

    <!-- Glossy Jelly Reflection Highlight -->
    <path d="M 44 48 C 42 38 52 30 65 30 C 72 30 80 34 84 39 C 75 36 60 38 52 46 C 46 52 45 60 45 68 C 42 62 44 53 44 48 Z"
          fill="#ffffff" opacity="0.75"/>
    <circle cx="148" cy="48" r="5" fill="#ffffff" opacity="0.7"/>
    <circle cx="156" cy="58" r="2.5" fill="#ffffff" opacity="0.6"/>
  </g>
</svg>
"""

# 4. cat_stamp_clear.svg (Celebratory Clear Stamp Emblem)
stamp_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff9c4"/>
      <stop offset="50%" stop-color="#fbc02d"/>
      <stop offset="100%" stop-color="#f57f17"/>
    </linearGradient>
    <linearGradient id="innerPeach" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffebee"/>
      <stop offset="100%" stop-color="#ffcdd2"/>
    </linearGradient>
    <filter id="stampGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#fbc02d" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Confetti bits around -->
  <g>
    <circle cx="32" cy="40" r="5" fill="#ff4081"/>
    <polygon points="168,44 174,38 178,46" fill="#00e5ff"/>
    <rect x="25" y="145" width="8" height="6" rx="2" fill="#76ff03" transform="rotate(25, 25, 145)"/>
    <circle cx="165" cy="155" r="4.5" fill="#ffd700"/>
    <path d="M 98 12 Q 102 12 102 6 Q 102 12 106 12 Q 102 12 102 18 Q 102 12 98 12 Z" fill="#ffd700"/>
  </g>

  <g filter="url(#stampGlow)">
    <!-- Cat Ears on Stamp -->
    <polygon points="52,65 30,22 82,45" fill="url(#goldRing)" stroke="#ffffff" stroke-width="3"/>
    <polygon points="52,60 38,30 74,48" fill="#ff80ab"/>

    <polygon points="148,65 170,22 118,45" fill="url(#goldRing)" stroke="#ffffff" stroke-width="3"/>
    <polygon points="148,60 162,30 126,48" fill="#ff80ab"/>

    <!-- Main Gold Coin Circle -->
    <circle cx="100" cy="104" r="70" fill="url(#goldRing)" stroke="#ffffff" stroke-width="4"/>
    <circle cx="100" cy="104" r="61" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="6,4"/>

    <!-- Inner Peach Face Area -->
    <circle cx="100" cy="104" r="54" fill="url(#innerPeach)"/>

    <!-- Cute Smiling Cat Eyes & Mouth -->
    <g stroke="#3e2723" stroke-width="3.5" stroke-linecap="round" fill="none">
      <!-- Left Eye Happy Arc -->
      <path d="M 75 92 Q 83 82 91 92"/>
      <!-- Right Eye Happy Arc -->
      <path d="M 109 92 Q 117 82 125 92"/>
      <!-- Nose & Mouth -->
      <path d="M 95 102 Q 100 106 105 102"/>
      <path d="M 100 102 L 100 106 Q 94 112 88 108"/>
      <path d="M 100 106 Q 106 112 112 108"/>
    </g>
    <!-- Pink Cheeks -->
    <ellipse cx="72" cy="102" rx="6" ry="3.5" fill="#ff4081" opacity="0.6"/>
    <ellipse cx="128" cy="102" rx="6" ry="3.5" fill="#ff4081" opacity="0.6"/>

    <!-- Bottom Red Banner with "CLEAR!" -->
    <g transform="translate(100, 138)">
      <path d="M -54 -12 L 54 -12 L 48 14 L -48 14 Z" fill="#e91e63" stroke="#ffffff" stroke-width="2.5"/>
      <text x="0" y="6" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle" letter-spacing="2">PURRFECT!</text>
    </g>
  </g>
</svg>
"""

# Write all SVGs
files = {
    "reward_churu.svg": churu_svg,
    "reward_ticket.svg": ticket_svg,
    "cat_paw_heart.svg": heart_svg,
    "cat_stamp_clear.svg": stamp_svg
}

for name, content in files.items():
    filepath = os.path.join(assets_dir, name)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Created: {filepath}")

# Generate high-res 512x512 PNGs using headless Chrome
html_template = """<!DOCTYPE html>
<html>
<body style="margin:0; background:transparent; display:flex; align-items:center; justify-content:center; width:512px; height:512px; overflow:hidden;">
  <img src="{svg_path}" style="width:480px; height:480px; object-fit:contain;" />
</body>
</html>"""

chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

for name in files.keys():
    base_name = name.replace(".svg", "")
    svg_file = os.path.join(assets_dir, name)
    png_file = os.path.join(assets_dir, f"{base_name}.png")
    temp_html = os.path.join("/tmp", f"render_{base_name}.html")
    
    with open(temp_html, "w") as f:
        f.write(html_template.format(svg_path=svg_file))
        
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--default-background-color=00000000",
        "--window-size=512,512",
        f"--screenshot={png_file}",
        temp_html
    ]
    subprocess.run(cmd, check=True)
    print(f"Generated High-Res PNG: {png_file}")

print("All cute visual assets generated successfully!")
