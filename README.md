# 이혜진 | 동네 업체 마케팅 파트너

개인 프리랜서 마케터의 서비스·가격 안내용 단일 페이지 정적 사이트입니다.
프레임워크와 빌드 단계 없이 HTML/CSS/JS만 사용하며 GitHub Pages로 배포합니다.

## 파일

| 파일 | 역할 |
|---|---|
| `index.html` | 페이지 구조와 고정 문구 |
| `styles.css` | 스타일 (모바일 우선, 다크모드 지원) |
| `script.js` | `data/pricing.json`을 불러와 패키지 카드와 표를 그림 |
| `data/pricing.json` | 모든 금액과 패키지 구성 |

## 로컬에서 확인하기

`fetch`로 JSON을 읽기 때문에 `index.html`을 더블클릭(`file://`)하면 가격이 보이지 않습니다.
저장소 폴더에서 간단한 서버를 켜세요.

```bash
python3 -m http.server 8000
```

브라우저에서 <http://localhost:8000> 을 엽니다. 끝낼 때는 터미널에서 `Ctrl+C`.

## 가격 수정

- 금액은 `data/pricing.json`에만 있습니다. HTML/JS에는 금액 숫자를 넣지 않습니다.
- 금액은 원 단위 정수로 적습니다. (예: `360000` → 화면에 "36만원", `15000` → "1.5만원")
- `lastUpdated`를 `YYYY-MM-DD` 형식의 실제 날짜로 바꾸면 푸터에 "가격 기준일"이 표시됩니다.

## 배포 (GitHub Pages)

저장소 **Settings → Pages**에서 Branch를 `main` / `/ (root)`로 정하고 저장합니다.

## 검색 노출

처음에는 링크를 받은 사람만 보도록 `index.html`에 `<meta name="robots" content="noindex">`가 들어 있습니다.
검색에 노출하려면 이 줄을 지우세요.
