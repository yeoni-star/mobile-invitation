# mobile-invitation

2026.11.07 모바일 청첩장. 단일 정적 페이지(`index.html`)로 구성되어 있으며 별도 빌드 과정이 없습니다.

## 로컬에서 보기

`index.html`을 정적 서버로 열면 됩니다 (file:// 로 직접 열면 상대 경로 이미지가 안 보일 수 있어요).

```bash
npx serve .
```

## 구성

- 표지 → 인사말 → 가장 빛나는 하루(캘린더/디데이 + 오시는 길) → 갤러리(스와이프) → 방명록 → 마무리(마음 전하실 곳 + 감사 인사)
- 참석 여부 팝업 (스크롤 중 1회 자동 노출, 우측 하단 알약 버튼으로 재오픈 가능)
- 우측 상단 BGM on/off 토글 ("Gymnopedie No. 1", Kevin MacLeod, CC BY 4.0 — 하단에 출처 표기)
- 방명록·참석여부는 Google Apps Script 웹앱을 통해 Google Sheets에 저장/조회됩니다 (`SHEET_ENDPOINT` 상수, 스프레드시트 "청첩장 응답 - 진규석 배시연")

## 남은 작업

- `assets/gallery/`에 사진 추가/교체 시 `index.html`의 `<img>` 목록만 늘리면 됩니다
- `[ ]`로 표시된 부모님 성함(친가/외가 중 비어있는 항목)·계좌번호 placeholder 채우기
- 오시는 길 지하철/버스/자가용 안내 문구 채우기
