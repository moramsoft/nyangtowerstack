import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "store_assets"
RAW_DIR = os.path.join(OUTPUT_DIR, "raw_captures")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. Process App Icon (512x512)
icon_source = "/Users/seunghwanson/.gemini/antigravity/brain/ef916861-6a53-414a-a9cc-d95c350ccc4c/store_icon_borderless_1791616391058.jpg"
if os.path.exists(icon_source):
    im_icon = Image.open(icon_source).convert("RGBA")
    # Resize to exact 512x512
    im_icon_512 = im_icon.resize((512, 512), Image.Resampling.LANCZOS)
    icon_out = os.path.join(OUTPUT_DIR, "icon_512x512.png")
    im_icon_512.save(icon_out, format="PNG")
    print(f"Saved: {icon_out} ({im_icon_512.size})")

# 2. Process Feature Graphic (1024x500)
feat_source = "/Users/seunghwanson/.gemini/antigravity/brain/ef916861-6a53-414a-a9cc-d95c350ccc4c/store_feature_graphic_1791616366044.jpg"
if os.path.exists(feat_source):
    im_feat = Image.open(feat_source).convert("RGB")
    # Original is 1376x768. Target is 1024x500 (aspect 2.048:1).
    # Crop to aspect ratio 2.048:
    w, h = im_feat.size
    target_aspect = 1024.0 / 500.0
    crop_h = int(w / target_aspect)
    if crop_h <= h:
        top = (h - crop_h) // 2
        im_cropped = im_feat.crop((0, top, w, top + crop_h))
    else:
        crop_w = int(h * target_aspect)
        left = (w - crop_w) // 2
        im_cropped = im_feat.crop((left, 0, left + crop_w, h))

    im_feat_1024 = im_cropped.resize((1024, 500), Image.Resampling.LANCZOS)
    feat_out = os.path.join(OUTPUT_DIR, "feature_graphic_1024x500.png")
    im_feat_1024.save(feat_out, format="PNG")
    print(f"Saved: {feat_out} ({im_feat_1024.size})")

# 3. Create Store Screenshots (1080x1920)
# Fonts
FONT_PATH = "/System/Library/Fonts/AppleSDGothicNeo.ttc"
font_badge = ImageFont.truetype(FONT_PATH, 34, index=7) # Bold
font_title = ImageFont.truetype(FONT_PATH, 66, index=8) # Heavy / ExtraBold
font_sub = ImageFont.truetype(FONT_PATH, 36, index=5) # Medium

screenshot_meta = [
    {
        "filename": "screenshot_1_gameplay.png",
        "raw": "screen_gameplay.png",
        "badge": "★ 3D 힐링 스택 액션 ★",
        "badge_color": (255, 64, 129),
        "title": "한 손으로 톡! 탭하여 쌓는 캣타워",
        "sub": "타이밍 맞춰 완벽하게 착지하고 영롱한 멜로디를 완성하세요!",
        "bg_top": (26, 18, 48),
        "bg_bottom": (15, 11, 28)
    },
    {
        "filename": "screenshot_2_companions.png",
        "raw": "screen_companions.png",
        "badge": "★ 귀여운 동료 냥이 18종 ★",
        "badge_color": (255, 160, 0),
        "title": "다채로운 매력의 고양이 수집 & 출격",
        "sub": "월드 포지션별 고유 버프로 캣타워 등반을 든든하게 도와줘요!",
        "bg_top": (28, 20, 52),
        "bg_bottom": (16, 12, 32)
    },
    {
        "filename": "screenshot_3_boss.png",
        "raw": "screen_boss.png",
        "badge": "★ 박진감 넘치는 보스전 ★",
        "badge_color": (230, 40, 80),
        "title": "거대 보스냥 격파 & 다채로운 기믹!",
        "sub": "스피드 러시, 정밀 스택, 흔들리는 타워까지 흥미진진한 도전!",
        "bg_top": (42, 16, 32),
        "bg_bottom": (20, 10, 20)
    },
    {
        "filename": "screenshot_4_gacha.png",
        "raw": "screen_gacha.png",
        "badge": "★ 행운의 냥이 캡슐 가챠 ★",
        "badge_color": (255, 193, 7),
        "title": "티켓과 츄르로 두근두근 캡슐 뽑기!",
        "sub": "전설의 고양이를 모아 나만의 드림 냥이 컬렉션을 완성하세요!",
        "bg_top": (32, 22, 54),
        "bg_bottom": (18, 14, 34)
    },
    {
        "filename": "screenshot_5_select.png",
        "raw": "screen_select.png",
        "badge": "★ 10개 월드 & 120+ 스테이지 ★",
        "badge_color": (33, 150, 243),
        "title": "포근한 마을부터 밤하늘 정원까지",
        "sub": "스테이지마다 달라지는 아름다운 배경과 감성적인 힐링 테마!",
        "bg_top": (22, 26, 56),
        "bg_bottom": (14, 16, 36)
    },
    {
        "filename": "screenshot_6_home.png",
        "raw": "screen_start.png",
        "badge": "★ 쾌적한 원터치 플레이 ★",
        "badge_color": (156, 39, 176),
        "title": "깔끔한 퀵독 & 언제 어디서나 힐링!",
        "sub": "데이터 걱정 없는 오프라인 지원, 집사님을 위한 완벽한 고양이 게임!",
        "bg_top": (24, 20, 48),
        "bg_bottom": (15, 12, 28)
    }
]

def make_gradient(width, height, top_color, bot_color):
    base = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(base)
    for y in range(height):
        r = int(top_color[0] + (bot_color[0] - top_color[0]) * (y / height))
        g = int(top_color[1] + (bot_color[1] - top_color[1]) * (y / height))
        b = int(top_color[2] + (bot_color[2] - top_color[2]) * (y / height))
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return base

for item in screenshot_meta:
    raw_path = os.path.join(RAW_DIR, item["raw"])
    if not os.path.exists(raw_path):
        print(f"Warning: {raw_path} not found")
        continue

    # Create 1080x1920 canvas
    canvas = make_gradient(1080, 1920, item["bg_top"], item["bg_bottom"])
    draw = ImageDraw.Draw(canvas)

    # 1. Badge Pill
    badge_text = item["badge"]
    bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
    bw = bbox[2] - bbox[0]
    bh = bbox[3] - bbox[1]
    bx = (1080 - bw) // 2
    by = 55
    pad_x, pad_y = 28, 10
    draw.rounded_rectangle(
        [bx - pad_x, by - pad_y, bx + bw + pad_x, by + bh + pad_y],
        radius=24,
        fill=item["badge_color"]
    )
    draw.text((bx, by - 2), badge_text, fill=(255, 255, 255), font=font_badge)

    # 2. Title Text with drop shadow
    title_text = item["title"]
    tbox = draw.textbbox((0, 0), title_text, font=font_title)
    tw = tbox[2] - tbox[0]
    tx = (1080 - tw) // 2
    ty = by + bh + pad_y + 30

    # Shadow
    draw.text((tx + 2, ty + 3), title_text, fill=(0, 0, 0, 150), font=font_title)
    # White text
    draw.text((tx, ty), title_text, fill=(255, 255, 255), font=font_title)

    # 3. Subtitle Text
    sub_text = item["sub"]
    sbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw = sbox[2] - sbox[0]
    sx = (1080 - sw) // 2
    sy = ty + (tbox[3] - tbox[1]) + 18

    draw.text((sx + 1, sy + 2), sub_text, fill=(0, 0, 0, 130), font=font_sub)
    draw.text((sx, sy), sub_text, fill=(225, 220, 240), font=font_sub)

    # 4. Device Bezel Frame
    im_screen = Image.open(raw_path).convert("RGBA")
    # Target phone frame width = 820
    target_sw = 820
    sw_orig, sh_orig = im_screen.size
    target_sh = int(sh_orig * (target_sw / sw_orig))
    im_screen_resized = im_screen.resize((target_sw, target_sh), Image.Resampling.LANCZOS)

    # Rounded mask for screen content
    corner_radius = 48
    mask = Image.new("L", (target_sw, target_sh), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, target_sw, target_sh], radius=corner_radius, fill=255)

    # Frame position
    fx = (1080 - target_sw) // 2
    fy = sy + (sbox[3] - sbox[1]) + 38

    # Outer border / bezel
    bezel_pad = 8
    draw.rounded_rectangle(
        [fx - bezel_pad, fy - bezel_pad, fx + target_sw + bezel_pad, fy + target_sh + bezel_pad],
        radius=corner_radius + bezel_pad,
        outline=(255, 255, 255, 110),
        width=3
    )

    # Paste rounded screen
    canvas.paste(im_screen_resized, (fx, fy), mask)

    out_file = os.path.join(OUTPUT_DIR, item["filename"])
    canvas.save(out_file, format="PNG")
    print(f"Saved store screenshot: {out_file}")

print("All store assets successfully created!")
