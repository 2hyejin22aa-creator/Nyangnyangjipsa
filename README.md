# 이혜진 · SNS 마케팅 · 영상 편집 · 기획

프레임워크와 빌드 단계 없이 HTML/CSS/JS만 쓰는 정적 사이트입니다. GitHub Pages로 배포합니다.

## 페이지

| 주소 | 파일 | 내용 |
|---|---|---|
| `/` | `index.html` | 홈 |
| `/services/` | `services/index.html`, `services/script.js` | SNS 마케팅 (주소 변경 금지: 이미 공유된 링크) |
| `/video/` | `video/index.html` | 영상 편집 |
| `/planning/` | `planning/index.html` | 기획 |
| `/works/` | `works/index.html`, `works/script.js` | 작업물 |

공통 파일: `assets/site.css`(스타일), `assets/nav.js`(탭 바), `assets/pricing.js`(가격 표시), `data/pricing.json`(모든 금액), `data/works.json`(작업물 목록).
모든 페이지는 상대 경로를 쓰기 때문에 `/저장소이름/` 아래에서도, 내 도메인 루트에서도 그대로 동작합니다.

## 로컬에서 확인하기

`fetch`로 JSON을 읽기 때문에 `index.html`을 더블클릭(`file://`)하면 가격이 보이지 않습니다.
저장소 **루트**에서 간단한 서버를 켜세요.

```bash
python3 -m http.server 8000
```

브라우저에서 <http://localhost:8000/> 을 엽니다. 끝낼 때는 터미널에서 `Ctrl+C`.

## 가격 수정

- 금액은 `data/pricing.json`에만 있습니다. HTML/JS에는 금액 숫자를 넣지 않습니다.
- 금액은 원 단위 정수로 적습니다. (예: `360000` → 화면에 "36만원", `15000` → "1.5만원")
- `setup`, `options`, `singles`의 각 항목에는 `category`가 있습니다. 페이지별로 이 값에 맞는 항목만 표시됩니다.
  - `sns`: `/services/` 표 (`plan`, `video`가 아닌 나머지 전부)
  - `video`: `/video/` 표
  - `plan`: `/planning/` 표
- `lastUpdated`를 `YYYY-MM-DD` 형식의 날짜로 바꾸면 푸터에 "가격 기준일"이 표시됩니다.

## 작업물 추가 방법

작업물 탭은 `data/works.json`에 항목이 **3개 이상**일 때만 탭 바와 홈에 나타납니다. (처음에는 빈 배열 `[]`)

1. 이미지나 영상 파일을 `works/media/` 폴더에 넣습니다. (예: `works/media/post-01.jpg`)
2. `data/works.json`에 항목을 추가합니다. 경로는 **사이트 루트 기준**입니다.

```json
[
  { "type": "image", "src": "works/media/post-01.jpg", "channel": "인스타", "caption": "캡션 한 줄" },
  { "type": "video", "src": "works/media/reel-01.mp4", "poster": "works/media/reel-01.jpg", "channel": "영상", "caption": "캡션 한 줄" }
]
```

| 필드 | 설명 |
|---|---|
| `type` | `image` 또는 `video` |
| `src` | 파일 경로 (사이트 루트 기준) |
| `poster` | 영상 대표 이미지 (영상일 때) |
| `channel` | 채널 이름. 서로 다른 채널이 2개 이상이면 필터 버튼이 생깁니다 |
| `caption` | 캡션 (한 줄) |

이미지는 지연 로딩되고, 영상은 소리 없이 자동 반복 재생됩니다(`muted autoplay loop playsinline`).

## 배포 (GitHub Pages)

저장소 **Settings → Pages**에서 Branch를 `main` / `/ (root)`로 정하고 저장합니다.

## 검색 노출

`/services/`, `/video/`, `/planning/`, `/works/`에는 `<meta name="robots" content="noindex">`가 들어 있습니다.
검색에 노출하려면 각 페이지에서 이 줄을 지우세요.
