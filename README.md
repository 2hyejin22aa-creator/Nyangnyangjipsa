# SNS 마케팅 · 콘텐츠 제작 · 기획

프레임워크와 빌드 단계 없이 HTML/CSS/JS만 쓰는 정적 사이트입니다. GitHub Pages로 배포합니다.

## 페이지

| 주소 | 파일 | 내용 |
|---|---|---|
| `/` | `index.html` | 홈 |
| `/services/` | `services/index.html`, `services/script.js` | SNS 마케팅 (주소 변경 금지: 이미 공유된 링크) |
| `/content/` | `content/index.html` | 콘텐츠 제작 (블로그 · 카드뉴스 · 릴스 · 배너·포스터) |
| `/video/` | `video/index.html` | 예전 주소. `/content/`로 이동만 합니다 |
| `/planning/` | `planning/index.html` | 기획 |
| `/works/` | `works/index.html`, `works/script.js` | 작업물 |

공통 파일: `assets/site.css`(스타일), `assets/site.js` + `data/site.json`(상단 로고·푸터·운영자 표기), `assets/nav.js`(탭 바), `assets/pricing.js`(가격 표시), `data/pricing.json`(모든 금액), `assets/media.js`(이미지·영상 슬롯), `data/media.json`(이미지·영상 자리와 작업물).
모든 페이지는 상대 경로를 쓰기 때문에 `/저장소이름/` 아래에서도, 내 도메인 루트에서도 그대로 동작합니다.

## 로컬에서 확인하기

`fetch`로 JSON을 읽기 때문에 `index.html`을 더블클릭(`file://`)하면 가격이 보이지 않습니다.
저장소 **루트**에서 간단한 서버를 켜세요.

```bash
python3 -m http.server 8000
```

브라우저에서 <http://localhost:8000/> 을 엽니다. 끝낼 때는 터미널에서 `Ctrl+C`.

## 상단 로고·이름 표기 수정

`data/site.json` 한 곳에서 읽습니다. HTML에는 이름을 적지 않습니다.

```json
{ "brandName": "로고 텍스트", "brandSub": "로고 옆 작은 글씨", "ownerName": "이름" }
```

- `brandName`: 상단 로고와 푸터에 중간 굵기로 표시됩니다.
- `brandSub`: 로고 옆에 작고 옅게 표시됩니다. 푸터에서는 "○○ · 개인 프리랜서"로 이어집니다.
- `ownerName`: `/services/` 맨 아래 문의 영역에 "운영: ○○" 한 줄(작은 글씨)로만 표시됩니다. 비워 두면 표시하지 않습니다.

## 가격 수정

- 금액은 `data/pricing.json`에만 있습니다. HTML/JS에는 금액 숫자를 넣지 않습니다.
- 금액은 원 단위 정수로 적습니다. (예: `360000` → 화면에 "36만원", `15000` → "1.5만원")
- `setup`, `options`, `singles`의 각 항목에는 `category`가 있습니다. 페이지별로 이 값에 맞는 항목만 표시됩니다.
  - `sns`: `/services/` 표 (`plan`, `video`가 아닌 나머지 전부)
  - `video`: 릴스·클립 관련 항목 (화면에서는 `/content/`의 형식 카드가 `data-money`로 이름을 찾아 금액을 읽음)
  - `plan`: `/planning/` 표
- `lastUpdated`를 `YYYY-MM-DD` 형식의 날짜로 바꾸면 푸터에 "가격 기준일"이 표시됩니다.
- `packages`는 3개(`lite`, `basic`, `plus`)입니다. `price`는 월 금액, `listPrice`는 단건·옵션으로 따로 맡길 때의 합계(= 단건·옵션 가격을 더한 값)입니다. `recommended: true`인 패키지에 "추천" 표시가 붙고 3개월 플랜 박스의 기본 선택이 됩니다.
- `plan`은 3개월 **선결제** 전용입니다(월 단위로 나눠 내는 3개월 옵션은 없음). `waiver`(면제 세팅비), `prepayTotal`(선결제 총액), `waiverDetail`(면제 항목 문구)은 패키지 `id`별로 적습니다. 월 환산액·절약액·중도 해지 정산 예시·혜택 4칸의 "N~M만원"은 모두 이 값에서 계산합니다. 화면 문구에는 숫자를 적지 않습니다.
- `contentSpec`은 `/content/` 형식 카드(블로그·카드뉴스·릴스·배너)에 보이는 제작 기준 한 줄입니다(`blog`, `cardnews`, `reels`, `banner`). 글자 수·분량·수정 횟수 같은 숫자는 여기서만 고칩니다. 키를 지우면 그 줄은 숨겨집니다.
- 항목(`singles`, `options`, `setup`)에 `steps`(문자열 배열)와 `needs`(문자열)를 적으면 `/content/` 가격 행 아래에 "작업 과정 보기" 접힘이 생깁니다. `steps`는 번호 목록으로, `needs`는 "받아야 할 것: …" 한 줄로 그대로 표시됩니다. `steps`가 없는 항목에는 접힘이 나오지 않습니다.

## 새 이미지 추가 방법

이미지와 영상은 `data/media.json`에 한 줄을 적어야 화면에 나타납니다. 파일이 없는 자리는 구역 전체가 숨겨져서 화면에 아무것도 남지 않습니다.

1. **파일 넣기**: 이미지나 영상 파일을 `assets/media/` 폴더에 넣습니다. (예: `assets/media/place-before.jpg`)
2. **`data/media.json`에 한 줄 추가**: 아래 자리(`slots`) 중 해당 항목의 `files`에 파일 경로를 적고, `alt`(이미지 설명, 필수)와 `caption`(캡션 한 줄)을 채웁니다. 경로는 사이트 루트 기준(`assets/media/...`)입니다.
3. **확인**: `python3 -m http.server 8000`으로 서버를 켜고 해당 페이지를 열어 봅니다. 이미지가 보이고, 눌렀을 때 크게 보이는지(Esc 또는 닫기 버튼으로 닫힘) 확인합니다.

### 자리(슬롯) 목록

| id | 페이지 | 종류 | `files` |
|---|---|---|---|
| `services/place-compare` | /services/ | `compare` | 전 이미지, 후 이미지 (2개) |
| `services/insta-compare` | /services/ | `compare` | 전 이미지, 후 이미지 (2개) |
| `services/blog-search` | /services/ | `image` | 이미지 1개 |
| `services/report` | /services/ | `image` | 이미지 1개 |
| `content/reels` | /content/ | `video` | 영상 1~3개 (`posters`에 대표 이미지를 같은 순서로) |
| `planning/calendar` | /planning/ | `image` | 이미지 1개 |
| `planning/branding` | /planning/ | `image` | 이미지 1개 |

예시 (`slots`의 `services/place-compare` 항목):

```json
{ "id": "services/place-compare", "page": "services", "section": "Before & After", "type": "compare",
  "files": ["assets/media/place-before.jpg", "assets/media/place-after.jpg"],
  "alt": "이미지 설명", "caption": "캡션 한 줄", "width": 1200, "height": 800 }
```

- `section`은 화면에서 어느 구역인지 알아보기 위한 메모입니다.
- `width`, `height`(픽셀)를 적으면 이미지가 로딩되는 동안 화면이 밀리지 않습니다. 적지 않으면 불러온 뒤 실제 크기를 기록합니다.
- `alt`가 비어 있으면 그 자리는 표시되지 않습니다.
- 이미지는 지연 로딩되고, 영상은 소리 없이 자동 반복 재생됩니다(`muted autoplay loop playsinline`, 대표 이미지 `poster`).

### 작업물 탭

`gallery`에 항목을 3개 이상 넣으면 탭 바와 홈에 "작업물"이 나타납니다. (실제로 파일이 있는 항목만 셉니다.)

```json
{ "type": "image", "file": "assets/media/work-01.jpg", "channel": "인스타", "alt": "이미지 설명", "caption": "캡션 한 줄" }
{ "type": "video", "file": "assets/media/work-02.mp4", "poster": "assets/media/work-02.jpg", "channel": "영상", "alt": "영상 설명", "caption": "캡션 한 줄" }
```

`channel`이 2종류 이상이면 채널 필터 버튼이 생깁니다.

## 성과 데이터 (홈)

`data/results.json`에 업체별 통계를 적으면 홈에 "성과 데이터" 카드가 생깁니다. 값은 통계 화면에 보이는 숫자를 그대로 적고, 비어 있으면 구역이 보이지 않습니다.

```json
{ "label": "업체 A", "title": "플레이스 유입", "subtitle": "월간",
  "rows":    [{ "period": "5월", "prev": 473, "value": 651, "change": 38 }],
  "metrics": [{ "name": "예약·주문 신청", "prev": 371, "value": 410, "change": 11 }] }
```

`change`는 화면에 표시된 증가율(%)입니다. `"did": ["한 일 한 줄", ...]`을 넣으면 작업물 페이지의 사례 카드에 "한 일" 목록이 함께 보입니다. 통계 화면 원본은 `data/media.json`의 `gallery`에 `"channel": "플레이스 통계"`로 올립니다.

## 배포 (GitHub Pages)

저장소 **Settings → Pages**에서 Branch를 `main` / `/ (root)`로 정하고 저장합니다.

## 검색 노출

`/services/`, `/content/`, `/video/`, `/planning/`, `/works/`에는 `<meta name="robots" content="noindex">`가 들어 있습니다.
검색에 노출하려면 각 페이지에서 이 줄을 지우세요.
