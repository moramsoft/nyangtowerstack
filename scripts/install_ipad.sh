#!/bin/bash
set -euo pipefail

BOLD="\033[1m"
GREEN="\033[32m"
RED="\033[31m"
YELLOW="\033[33m"
CYAN="\033[36m"
RESET="\033[0m"

echo -e "\n${BOLD}${CYAN}============================================================${RESET}"
echo -e "${BOLD}${CYAN}    MEOW STACK TOWER — IOS DEVICE BUILD & INSTALL           ${RESET}"
echo -e "${BOLD}${CYAN}============================================================${RESET}\n"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

# 1. Sync web assets first
echo -e "${BOLD}[1/4] Synchronizing game assets to iOS...${RESET}"
node scripts/verify_syntax.js --sync > /dev/null
echo -e "${GREEN}✓ Assets synchronized.${RESET}\n"

# 2. Detect connected device
echo -e "${BOLD}[2/4] Detecting connected physical iOS/iPadOS device...${RESET}"
DEVICE_ID="${1:-}"
if [ -z "$DEVICE_ID" ]; then
  DEVICE_LINE="$(xcrun devicectl list devices 2>/dev/null | grep -E "physical\s*$" | head -n 1 || true)"
  if [ -z "$DEVICE_LINE" ]; then
    echo -e "${RED}✗ No connected physical iOS device found via xcrun devicectl!${RESET}"
    exit 1
  fi
  DEVICE_ID="$(echo "$DEVICE_LINE" | awk '{print $3}')"
  DEVICE_NAME="$(echo "$DEVICE_LINE" | awk '{print $1, $2}')"
  echo -e "${GREEN}✓ Target device detected: ${DEVICE_NAME} (${DEVICE_ID})${RESET}\n"
else
  echo -e "${GREEN}✓ Using specified device ID: ${DEVICE_ID}${RESET}\n"
fi

# 3. Build & sign .app bundle
echo -e "${BOLD}[3/4] Compiling Swift source & code-signing app bundle...${RESET}"
TARGET_DEVICE_ID="$DEVICE_ID" python3 - << 'EOF'
import os, sys, subprocess, shutil, plistlib, datetime

project_dir = os.getcwd()
ios_dir = os.path.join(project_dir, "ios/MeowStackTower")
build_dir = "/tmp/MeowStackTower_build"
app_bundle = os.path.join(build_dir, "MeowStackTower.app")
target_device = os.environ.get("TARGET_DEVICE_ID", "").strip()

shutil.rmtree(build_dir, ignore_errors=True)
os.makedirs(app_bundle, exist_ok=True)

# Find valid non-expired provisioning profile provisioned for target device
profile_dir = os.path.expanduser("~/Library/Developer/Xcode/UserData/Provisioning Profiles")
valid_profiles = []

if os.path.exists(profile_dir):
    now = datetime.datetime.now(datetime.timezone.utc)
    for fname in os.listdir(profile_dir):
        if not fname.endswith(".mobileprovision"):
            continue
        fpath = os.path.join(profile_dir, fname)
        try:
            with open(fpath, "rb") as f:
                raw = f.read()
            s = raw.find(b"<?xml")
            e = raw.find(b"</plist>") + len(b"</plist>")
            data = plistlib.loads(raw[s:e])
            exp = data.get("ExpirationDate")
            if exp and exp.tzinfo is None:
                exp = exp.replace(tzinfo=datetime.timezone.utc)
            if exp and exp > now:
                devices = data.get("ProvisionedDevices", [])
                if not target_device or target_device in devices:
                    valid_profiles.append((fpath, data))
        except Exception:
            continue

if not valid_profiles:
    raise RuntimeError("No valid, non-expired provisioning profile found for target device!")

# Prefer uitests / standalone test profile if available so existing apps are not overwritten
preferred_profile = None
for fpath, data in valid_profiles:
    app_id = data.get("Entitlements", {}).get("application-identifier", "")
    if "uitests" in app_id:
        preferred_profile = (fpath, data)
        break

if not preferred_profile:
    preferred_profile = valid_profiles[0]

profile_src, profile_plist = preferred_profile
app_id_full = profile_plist.get("Entitlements", {}).get("application-identifier", "")
team_id = profile_plist.get("TeamIdentifier", [""])[0]
bundle_id = app_id_full.replace(f"{team_id}.", "")

with open("/tmp/MeowStackTower_build/bundle_id.txt", "w") as bf:
    bf.write(bundle_id)

print(f"Selected profile: {os.path.basename(profile_src)}")
print(f"Target bundle identifier: {bundle_id}")

# Compile Swift sources with iphoneos SDK
sdk_path = subprocess.check_output(["xcrun", "--sdk", "iphoneos", "--show-sdk-path"]).decode().strip()
binary_path = os.path.join(app_bundle, "MeowStackTower")

compile_cmd = [
    "swiftc",
    "-sdk", sdk_path,
    "-target", "arm64-apple-ios17.0",
    "-emit-executable",
    "-O",
    "-o", binary_path,
    os.path.join(ios_dir, "AppDelegate.swift"),
    os.path.join(ios_dir, "ViewController.swift")
]
subprocess.run(compile_cmd, check=True)

# Copy Info.plist with device bundle ID
with open(os.path.join(ios_dir, "Info.plist"), "rb") as f:
    info_data = plistlib.load(f)

info_data["CFBundleIdentifier"] = bundle_id
info_data["CFBundleExecutable"] = "MeowStackTower"
info_data["CFBundleDisplayName"] = "Meow Stack Tower"

with open(os.path.join(app_bundle, "Info.plist"), "wb") as f:
    plistlib.dump(info_data, f)

# Copy provisioning profile
shutil.copyfile(profile_src, os.path.join(app_bundle, "embedded.mobileprovision"))

# Compile Assets.xcassets using actool
assets_dir = os.path.join(ios_dir, "Assets.xcassets")
if os.path.exists(assets_dir):
    partial_plist = os.path.join(build_dir, "actool_partial.plist")
    actool_cmd = [
        "xcrun", "actool",
        assets_dir,
        "--compile", app_bundle,
        "--platform", "iphoneos",
        "--minimum-deployment-target", "17.0",
        "--app-icon", "AppIcon",
        "--output-partial-info-plist", partial_plist
    ]
    subprocess.run(actool_cmd, check=True)
    if os.path.exists(partial_plist):
        with open(partial_plist, "rb") as pf:
            partial_data = plistlib.load(pf)
        info_data.update(partial_data)
        with open(os.path.join(app_bundle, "Info.plist"), "wb") as f:
            plistlib.dump(info_data, f)

# Copy direct AppIcon PNGs into app bundle root as well
for f in os.listdir(ios_dir):
    if f.startswith("AppIcon") and f.endswith(".png"):
        shutil.copyfile(os.path.join(ios_dir, f), os.path.join(app_bundle, f))

# Copy web bundle
shutil.copytree(os.path.join(ios_dir, "www"), os.path.join(app_bundle, "www"))

# Extract entitlements
entitlements = profile_plist.get("Entitlements", {})

entitlements_file = os.path.join(build_dir, "entitlements.plist")
with open(entitlements_file, "wb") as f:
    plistlib.dump(entitlements, f)

# Sign bundle
sign_cmd = [
    "codesign",
    "--force",
    "--sign", "9B19A56BB5965010DC7F3C4DEA2A0843609BB06D",
    "--entitlements", entitlements_file,
    "--timestamp=none",
    "--generate-entitlement-der",
    app_bundle
]
subprocess.run(sign_cmd, check=True)
EOF
echo -e "${GREEN}✓ Application bundle compiled and signed.${RESET}\n"

# 4. Install & Launch on Device
BUNDLE_ID="$(cat /tmp/MeowStackTower_build/bundle_id.txt)"
echo -e "${BOLD}[4/4] Installing & launching on iPad via devicectl (Bundle ID: ${BUNDLE_ID})...${RESET}"
xcrun devicectl device install app --device "$DEVICE_ID" /tmp/MeowStackTower_build/MeowStackTower.app
xcrun devicectl device process launch --device "$DEVICE_ID" --activate "$BUNDLE_ID" || echo -e "${YELLOW}ℹ Device is locked; please unlock your iPad to open the app.${RESET}"

echo -e "\n${BOLD}${GREEN}============================================================${RESET}"
echo -e "${BOLD}${GREEN}  🎉 MEOW STACK TOWER SUCCESSFULLY INSTALLED ON IPAD!       ${RESET}"
echo -e "${BOLD}${GREEN}============================================================${RESET}\n"
