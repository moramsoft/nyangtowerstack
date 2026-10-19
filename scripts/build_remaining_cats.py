import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

assets_dir = 'game/assets'

def create_cat_maru():
    # Base: chara_excited (jumping with both paws up, high energy!)
    base = Image.open(os.path.join(assets_dir, 'chara_excited.png')).convert('RGBA')
    w, h = base.size
    
    # Give warm golden-amber tabby tones
    r, g, b, a = base.split()
    rgb = Image.merge('RGB', (r, g, b))
    
    # Warm golden-orange tint for Maru
    enhancer = ImageEnhance.Color(rgb)
    rgb_sat = enhancer.enhance(1.4)
    arr = np.array(rgb_sat, dtype=np.float32)
    # Shift towards warm golden yellow/orange
    arr[:, :, 0] = np.clip(arr[:, :, 0] * 1.05 + 15, 0, 255)
    arr[:, :, 1] = np.clip(arr[:, :, 1] * 0.95 + 10, 0, 255)
    arr[:, :, 2] = np.clip(arr[:, :, 2] * 0.75, 0, 255)
    tinted_rgb = Image.fromarray(arr.astype(np.uint8), mode='RGB')
    
    maru = tinted_rgb.convert('RGBA')
    maru.putalpha(a)
    
    # Draw lightning badge & sparkles overlay
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Lightning bolt on chest / collar
    # Collar center is around (512, 600)
    cx, cy = 512, 600
    bolt_pts = [
        (cx + 8, cy - 35),
        (cx - 20, cy),
        (cx - 2, cy),
        (cx - 15, cy + 35),
        (cx + 22, cy - 5),
        (cx + 2, cy - 5)
    ]
    # Draw glowing outline for lightning bolt
    draw.polygon(bolt_pts, fill=(255, 235, 59, 255), outline=(255, 160, 0, 255), width=3)
    
    # Golden lightning sparkle stars around paws
    sparkles = [(220, 360), (800, 360), (180, 520), (840, 520)]
    for sx, sy in sparkles:
        draw.polygon([(sx, sy-18), (sx+5, sy-5), (sx+18, sy), (sx+5, sy+5), (sx, sy+18), (sx-5, sy+5), (sx-18, sy), (sx-5, sy-5)],
                     fill=(255, 241, 118, 240), outline=(255, 179, 0, 240), width=2)
        draw.circle((sx, sy), 3, fill=(255, 255, 255, 255))
        
    maru = Image.alpha_composite(maru, overlay)
    maru.save(os.path.join(assets_dir, 'cat_maru.png'), 'PNG')
    print("Created cat_maru.png")

def create_cat_toram():
    # Base: chara_clap (sturdy, balanced, paws together in solid center)
    base = Image.open(os.path.join(assets_dir, 'chara_clap.png')).convert('RGBA')
    w, h = base.size
    
    r, g, b, a = base.split()
    rgb = Image.merge('RGB', (r, g, b))
    
    # Warm tiger golden-amber coat
    arr = np.array(rgb, dtype=np.float32)
    arr[:, :, 0] = np.clip(arr[:, :, 0] * 1.1 + 25, 0, 255)
    arr[:, :, 1] = np.clip(arr[:, :, 1] * 0.92 + 10, 0, 255)
    arr[:, :, 2] = np.clip(arr[:, :, 2] * 0.65, 0, 255)
    tiger_rgb = Image.fromarray(arr.astype(np.uint8), mode='RGB')
    
    toram = tiger_rgb.convert('RGBA')
    toram.putalpha(a)
    
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Tiger stripes on forehead (around x=512, y=280)
    stripe_color = (60, 35, 20, 210)
    # Center vertical stripe
    draw.polygon([(507, 240), (517, 240), (514, 290), (510, 290)], fill=stripe_color)
    # Side forehead stripes
    draw.polygon([(465, 260), (485, 265), (460, 285)], fill=stripe_color)
    draw.polygon([(559, 260), (539, 265), (564, 285)], fill=stripe_color)
    # Cheek tiger stripes
    draw.polygon([(360, 390), (410, 400), (370, 415)], fill=stripe_color)
    draw.polygon([(664, 390), (614, 400), (654, 415)], fill=stripe_color)
    
    # Nautical Anchor Medallion on chest collar (around x=512, y=600)
    ax, ay = 512, 600
    # Red bandana ring
    draw.ellipse((ax - 32, ay - 32, ax + 32, ay + 32), fill=(211, 47, 47, 255), outline=(255, 215, 0, 255), width=4)
    # White anchor icon inside
    draw.line((ax, ay - 18, ax, ay + 16), fill=(255, 255, 255, 255), width=5)
    draw.line((ax - 12, ay - 10, ax + 12, ay - 10), fill=(255, 255, 255, 255), width=5)
    draw.arc((ax - 18, ay - 6, ax + 18, ay + 20), start=0, end=180, fill=(255, 255, 255, 255), width=5)
    draw.polygon([(ax - 20, ay + 4), (ax - 14, ay + 4), (ax - 17, ay - 2)], fill=(255, 255, 255, 255))
    draw.polygon([(ax + 20, ay + 4), (ax + 14, ay + 4), (ax + 17, ay - 2)], fill=(255, 255, 255, 255))
    draw.circle((ax, ay - 18), 4, fill=(255, 215, 0, 255))
    
    toram = Image.alpha_composite(toram, overlay)
    toram.save(os.path.join(assets_dir, 'cat_toram.png'), 'PNG')
    print("Created cat_toram.png")

def create_cat_shogun():
    # Base: cat_meowperor (regal seated pose)
    base = Image.open(os.path.join(assets_dir, 'cat_meowperor.png')).convert('RGBA')
    w, h = base.size
    
    r, g, b, a = base.split()
    rgb = Image.merge('RGB', (r, g, b))
    
    # Blazing crimson warlord color grade
    arr = np.array(rgb, dtype=np.float32)
    # Enhance crimson red while keeping gold
    red_boost = arr[:, :, 0] * 1.15 + 20
    green_shift = arr[:, :, 1] * 0.75
    blue_shift = arr[:, :, 2] * 0.70
    arr[:, :, 0] = np.clip(red_boost, 0, 255)
    arr[:, :, 1] = np.clip(green_shift, 0, 255)
    arr[:, :, 2] = np.clip(blue_shift, 0, 255)
    shogun_rgb = Image.fromarray(arr.astype(np.uint8), mode='RGB')
    
    shogun = shogun_rgb.convert('RGBA')
    shogun.putalpha(a)
    
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Japanese Samurai Kabuto Crescent Moon Crest (Golden Kuwagata) on crown/helmet (cx=512, cy=150)
    cx, cy = 512, 145
    # Golden crescent moon crest
    draw.arc((cx - 100, cy - 80, cx + 100, cy + 90), start=200, end=340, fill=(255, 223, 0, 255), width=18)
    draw.arc((cx - 100, cy - 80, cx + 100, cy + 90), start=200, end=340, fill=(255, 245, 157, 255), width=10)
    # Central golden gem/medallion on helmet
    draw.circle((cx, cy + 18), 16, fill=(183, 28, 28, 255), outline=(255, 215, 0, 255), width=4)
    draw.circle((cx, cy + 18), 6, fill=(255, 255, 255, 255))
    
    # Fiery combat battle marks on cheeks
    draw.line((355, 395, 385, 385), fill=(211, 47, 47, 220), width=4)
    draw.line((350, 410, 385, 400), fill=(211, 47, 47, 220), width=4)
    draw.line((669, 395, 639, 385), fill=(211, 47, 47, 220), width=4)
    draw.line((674, 410, 639, 400), fill=(211, 47, 47, 220), width=4)
    
    shogun = Image.alpha_composite(shogun, overlay)
    shogun.save(os.path.join(assets_dir, 'cat_shogun.png'), 'PNG')
    print("Created cat_shogun.png")

def create_cat_pharaoh():
    # Base: cat_meowperor
    base = Image.open(os.path.join(assets_dir, 'cat_meowperor.png')).convert('RGBA')
    w, h = base.size
    
    r, g, b, a = base.split()
    rgb = Image.merge('RGB', (r, g, b))
    
    # Lapis lazuli and radiant sun Egyptian color grade
    arr = np.array(rgb, dtype=np.float32)
    # Golden sand coat with royal turquoise tones
    arr[:, :, 0] = np.clip(arr[:, :, 0] * 1.1 + 10, 0, 255)
    arr[:, :, 1] = np.clip(arr[:, :, 1] * 1.05 + 10, 0, 255)
    arr[:, :, 2] = np.clip(arr[:, :, 2] * 0.85, 0, 255)
    pharaoh_rgb = Image.fromarray(arr.astype(np.uint8), mode='RGB')
    
    pharaoh = pharaoh_rgb.convert('RGBA')
    pharaoh.putalpha(a)
    
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Sun God Bastet: Glowing Golden Solar Disk above crown (cx=512, cy=105)
    cx, cy = 512, 105
    # Solar rays
    for angle in range(0, 360, 45):
        rad = np.radians(angle)
        x1 = cx + int(48 * np.cos(rad))
        y1 = cy + int(48 * np.sin(rad))
        x2 = cx + int(68 * np.cos(rad))
        y2 = cy + int(68 * np.sin(rad))
        draw.line((x1, y1, x2, y2), fill=(255, 235, 59, 230), width=4)
    # Radiant Golden Sun Disk
    draw.circle((cx, cy), 42, fill=(255, 179, 0, 255), outline=(255, 245, 157, 255), width=5)
    draw.circle((cx, cy), 28, fill=(255, 215, 0, 255))
    draw.circle((cx, cy), 14, fill=(255, 255, 255, 240))
    
    # Egyptian Bastet Kohl Eyeliner / Eye of Horus aesthetic around eyes
    # Left eye around (410, 355), Right eye around (614, 355)
    draw.arc((360, 330, 455, 380), start=180, end=350, fill=(38, 50, 56, 255), width=4)
    draw.line((370, 358, 345, 372), fill=(38, 50, 56, 255), width=4)
    draw.arc((569, 330, 664, 380), start=190, end=360, fill=(38, 50, 56, 255), width=4)
    draw.line((654, 358, 679, 372), fill=(38, 50, 56, 255), width=4)
    
    # Sacred Lapis & Gold Ankh pectoral amulet on chest (cx=512, cy=600)
    px, py = 512, 600
    # Turquoise round medallion
    draw.circle((px, py), 26, fill=(0, 172, 193, 255), outline=(255, 215, 0, 255), width=4)
    # Golden Ankh symbol
    draw.circle((px, py - 6), 9, fill=(0, 172, 193, 255), outline=(255, 235, 59, 255), width=3)
    draw.line((px, py + 2, px, py + 16), fill=(255, 235, 59, 255), width=4)
    draw.line((px - 8, py + 7, px + 8, py + 7), fill=(255, 235, 59, 255), width=4)
    
    pharaoh = Image.alpha_composite(pharaoh, overlay)
    pharaoh.save(os.path.join(assets_dir, 'cat_pharaoh.png'), 'PNG')
    print("Created cat_pharaoh.png")

if __name__ == '__main__':
    create_cat_maru()
    create_cat_toram()
    create_cat_shogun()
    create_cat_pharaoh()
