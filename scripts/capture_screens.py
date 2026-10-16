import subprocess
import time
import os

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE_URL = "http://127.0.0.1:8088/index.html"
RAW_DIR = "store_assets/raw_captures"
os.makedirs(RAW_DIR, exist_ok=True)

screens = [
    {
        "id": "screen_start",
        "url": f"{BASE_URL}?lang=ko",
        "wait": 1500,
    },
    {
        "id": "screen_gameplay",
        "url": f"{BASE_URL}?lang=ko&action=play&stage=1&autotap=5",
        "wait": 3600,
    },
    {
        "id": "screen_boss",
        "url": f"{BASE_URL}?lang=ko&action=boss&stage=4&boss_state=frenzy&quote=야옹!%20내가%20보스다냥!",
        "wait": 1500,
    },
    {
        "id": "screen_companions",
        "url": f"{BASE_URL}?lang=ko&action=companions&all=1",
        "wait": 1500,
    },
    {
        "id": "screen_gacha",
        "url": f"{BASE_URL}?lang=ko&action=gacha",
        "wait": 1500,
    },
    {
        "id": "screen_bonus",
        "url": f"{BASE_URL}?lang=ko&action=bonus&stage=18",
        "wait": 1800,
    },
]

for s in screens:
    out_path = os.path.join(RAW_DIR, f"{s['id']}.png")
    # Using mobile device metrics: 430 x 820 with scale factor 2.5 = 1075 x 2050 or 430x764
    # To get clean mobile layout for framing into 1080x1920:
    cmd = [
        CHROME,
        "--headless",
        "--disable-gpu",
        f"--virtual-time-budget={s['wait']}",
        f"--screenshot={out_path}",
        "--window-size=430,860",
        s["url"]
    ]
    print(f"Capturing {s['id']}...")
    subprocess.run(cmd, check=True)
    print(f"Captured {out_path}")

print("All screens captured!")
