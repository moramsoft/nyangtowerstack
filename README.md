# Meow Stack Tower 3D (냥이 스택 타워 3D) 🐾🗼🐱✨

> Ketchapp의 전설적인 1위 게임 「Stack」을 완벽하게 계승한 **3D 아이소메트릭(대각선 입체) 타워 쌓기 게임**에 **초귀요미 고양이 마스코트 & 냥타워 비주얼 연출**을 결합한 프리미엄 캐주얼 모바일 게임입니다.
> 100% 네이티브 하드웨어 가속 3D 투영 Canvas 단일 파일(`game/index.html`)과 Android WebView 래퍼(`android/`)로 구현되었습니다.

---

## 🐾 고양이 테마 업그레이드 핵심 특징 (진짜 1등 게임 퀄리티)

1. **3D 아이소메트릭 입체 큐브 & X/Z 교차 이동**:
   - 2D 평면 막대가 아닌, 마름모꼴 상단 하이라이트와 측면 입체 음영을 갖춘 **3D 육면체 프리즘**.
   - 1층은 X축(대각선 우하향), 2층은 Z축(대각선 좌하향)으로 **3차원 공간에서 교차 이동**.
   - **모든 블록 상단에 귀여운 젤리 발자국(🐾) 엠보싱 각인**!
2. **현실적인 3D 돌출부 슬라이스 (Trim Physics)**:
   - 겹치지 않는 돌출부가 3D 입체 조각으로 잘려나가며 회전과 중력에 의해 허공 아래로 떨어지는 극상의 손맛.
3. **절차적 마림바 + 귀여운 고양이 챠임 사운드 (Web Audio API)**:
   - 블록을 성공적으로 쌓을 때마다 `C4 → D4 → E4 → G4 → A4 ... C6`까지 맑고 영롱한 마림바 사운드가 계단식으로 상승.
   - PERFECT 시 귀여운 **고양이 "미유~" 고주파 챠임 효과음** 동시 연주!
   - 8연속 PERFECT 시 옥타브 팡파르 화음 + "츄르 대축제다 냥!!" 폭죽 연출 + 블록 크기 확장 보너스!
4. **집사와 교감하는 고양이 마스코트 (반응형 대사 & 표정)**:
   - 대기 상태: 얌전히 앉아서 꼬리 살랑 ("집사야! 냥타워를 쌓아줘 냥! 🐾")
   - 시작: 눈을 반짝이며 양발 번쩍 ("시작이다 냥! 높이 쌓아봐라 냥! 🐾")
   - 쌓기 성공: 식빵 굽기 모드 ("오구오구 잘한다 냥! 🐾", "식빵 굽는 중이다 냥~ 🍞")
   - PERFECT: 높이 점프 ("냥펙트!! ✨🐾", "천재 집사다 냥! 🔥")
   - 신기록: 황금 왕관을 쓰고 환호 ("우와아!! 역대 최고 기록이다 냥!! 👑🐟")
   - 게임 오버: 눈물 뚝뚝 우는 얼굴 ("으앙 캣타워가 무너졌다 냥... 😿")
5. **몽환적인 냥이 파티클 연출**:
   - 화면 배경에 부드럽게 흩날리는 **황금 물고기 비스킷(🐟)**, **분홍 젤리 발자국(🐾)**, **반짝이 별빛(✨)** 파티클.

---

## 📁 프로젝트 구조

```
stack-tower/
├── game/
│   ├── index.html                    ← 3D 아이소메트릭 고양이 스택 게임 본체
│   └── assets/                       ← 고양이 마스코트 스프라이트 6종 및 키 비주얼 1종
│       ├── chara_smile.png           (미소 짓는 흰 고양이)
│       ├── chara_excited.png         (별눈 양발 번쩍)
│       ├── chara_happy.png           (기쁨의 MEOW 점프)
│       ├── chara_clap.png            (칭찬 반응)
│       ├── chara_sad.png             (눈물 흘리는 고양이)
│       ├── chara_celebrate.png       (황금 왕관 세레모니)
│       └── keyvisual.png             (CAT STACK TOWER 키 비주얼)
├── android/                          ← Android Studio 네이티브 프로젝트
│   ├── app/
│   │   ├── build.gradle              (applicationId "com.bishoujo.stacktower", Target SDK 34)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml   (세로 고정, Fullscreen 테마, 고양이 런처 아이콘)
│   │       ├── java/com/bishoujo/stacktower/MainActivity.kt (풀스크린 WebView)
│   │       ├── res/mipmap-*/         (고양이 런처 아이콘 밀도별 등록)
│   │       └── assets/www/           (3D 웹 에셋 동기화)
├── store-assets/                     ← Google Play Console 등록용 에셋
│   ├── icon-512.png                  (512×512 고양이 앱 아이콘)
│   ├── feature-graphic-1024x500.png  (1024×500 그래픽 이미지)
│   ├── screenshot_1_title.png        (3D 타이틀 화면 캡처)
│   ├── screenshot_2_gameplay.png     (3D 인게임 타워 캡처)
│   └── screenshot_3_gameover.png     (게임 오버 캡처)
└── build-artifacts/
    └── CatStackTower-debug.apk       ← 안드로이드 기기 직접 설치용 APK (~14MB)
```

---

## 🚀 실행 및 테스트

```bash
# 1. 브라우저에서 즉시 테스트
open stack-tower/game/index.html

# 2. 안드로이드 실기기/에뮬레이터 설치
adb install -r stack-tower/build-artifacts/CatStackTower-debug.apk
```

---

## 🗺️ 캠페인 모드 (장기 플레이용 스테이지)

- **25개 월드 × 16 스테이지 = 400 스테이지** (월드의 마지막 스테이지는 👑 보스). 목표 층수(12~65층)를 쌓으면 클리어, 별 1~3개(냥펙트 비율 기준)를 획득합니다.
- 월드마다 새로운 기믹이 등장하고 점점 중첩됩니다: 속도 출렁임(wobble), 탑 흔들림(sway), 블록 깜빡임(blink), 갑작스러운 방향 전환(reverse), 실수 시 추가 감소(shrink).
- 월드 진입에는 누적 별(월드 번호 × 18개)이 필요하여 이전 스테이지 재도전(3★)을 유도합니다.
- 실패할수록 **냥이의 응원**(판정 완화·속도 감소, 최대 Lv.8)이 쌓여 막히지 않으며, 클리어하면 초기화됩니다.
- 진행도는 `localStorage`(`stackTowerCampaignV1`)에 저장됩니다. 기존 **무한 모드**도 메인 화면에서 그대로 즐길 수 있습니다.
- 난이도/플레이타임은 시뮬레이션 기준 숙련자 약 16h, 평균 약 26h(별 재도전·무한 모드 제외)로 설계되었습니다.
