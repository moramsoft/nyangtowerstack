import os
import subprocess

assets_dir = os.path.abspath("game/assets")
mouse_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="mouseBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b0bec5"/>
      <stop offset="100%" stop-color="#78909c"/>
    </linearGradient>
    <linearGradient id="earPink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff80ab"/>
      <stop offset="100%" stop-color="#f48fb1"/>
    </linearGradient>
    <filter id="mouseGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <g filter="url(#mouseGlow)">
    <!-- Curly Tail -->
    <path d="M 130 140 Q 170 145 165 115 Q 160 90 180 80" fill="none" stroke="#f48fb1" stroke-width="5" stroke-linecap="round"/>

    <!-- Round Ears -->
    <circle cx="64" cy="58" r="28" fill="url(#mouseBody)" stroke="#ffffff" stroke-width="3"/>
    <circle cx="64" cy="58" r="18" fill="url(#earPink)"/>

    <circle cx="136" cy="58" r="28" fill="url(#mouseBody)" stroke="#ffffff" stroke-width="3"/>
    <circle cx="136" cy="58" r="18" fill="url(#earPink)"/>

    <!-- Mouse Head/Body Egg -->
    <ellipse cx="100" cy="115" rx="52" ry="46" fill="url(#mouseBody)" stroke="#ffffff" stroke-width="3.5"/>

    <!-- Cute Big Anime Eyes with Highlights -->
    <ellipse cx="80" cy="106" rx="9" ry="12" fill="#263238"/>
    <circle cx="77" cy="102" r="4" fill="#ffffff"/>
    <circle cx="83" cy="112" r="2" fill="#ffffff"/>

    <ellipse cx="120" cy="106" rx="9" ry="12" fill="#263238"/>
    <circle cx="117" cy="102" r="4" fill="#ffffff"/>
    <circle cx="123" cy="112" r="2" fill="#ffffff"/>

    <!-- Pink Nose & Whiskers -->
    <ellipse cx="100" cy="120" rx="6" ry="4.5" fill="#e91e63"/>
    
    <!-- Whiskers -->
    <line x1="68" y1="120" x2="35" y2="114" stroke="#455a64" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="68" y1="124" x2="38" y2="128" stroke="#455a64" stroke-width="2.5" stroke-linecap="round"/>

    <line x1="132" y1="120" x2="165" y2="114" stroke="#455a64" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="132" y1="124" x2="162" y2="128" stroke="#455a64" stroke-width="2.5" stroke-linecap="round"/>

    <!-- Cute Blush Cheeks -->
    <ellipse cx="64" cy="122" rx="7" ry="4" fill="#ff80ab" opacity="0.6"/>
    <ellipse cx="136" cy="122" rx="7" ry="4" fill="#ff80ab" opacity="0.6"/>

    <!-- Little Paws in Front holding cheese -->
    <g transform="translate(100, 142)">
      <!-- Swiss Cheese Wedge -->
      <polygon points="0,-16 22,6 -22,6" fill="#ffd54f" stroke="#ffa000" stroke-width="2"/>
      <circle cx="-4" cy="-2" r="3" fill="#ffb300"/>
      <circle cx="8" cy="2" r="2" fill="#ffb300"/>
      <!-- Paws -->
      <circle cx="-16" cy="4" r="7" fill="url(#mouseBody)" stroke="#ffffff" stroke-width="2"/>
      <circle cx="16" cy="4" r="7" fill="url(#mouseBody)" stroke="#ffffff" stroke-width="2"/>
    </g>
  </g>
</svg>
"""

svg_file = os.path.join(assets_dir, "item_mouse.svg")
with open(svg_file, "w") as f:
    f.write(mouse_svg.strip())

png_file = os.path.join(assets_dir, "item_mouse.png")
temp_html = "/tmp/render_mouse.html"
with open(temp_html, "w") as f:
    f.write(f'<!DOCTYPE html><html><body style="margin:0; background:transparent; display:flex; align-items:center; justify-content:center; width:512px; height:512px;"><img src="{svg_file}" style="width:480px; height:480px;" /></body></html>')

chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
subprocess.run([chrome_path, "--headless=new", "--disable-gpu", "--default-background-color=00000000", "--window-size=512,512", f"--screenshot={png_file}", temp_html], check=True)
print("item_mouse.png generated!")
