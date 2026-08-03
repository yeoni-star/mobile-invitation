# mobile-invitation

2026.11.07 모바일 청첩장. 단일 정적 페이지(`index.html`)로 구성되어 있으며 별도 빌드 과정이 없습니다.

## 로컬에서 보기

`index.html`을 정적 서버로 열면 됩니다 (file:// 로 직접 열면 상대 경로 이미지가 안 보일 수 있어요).

```bash
npx serve .
```

## 구성

- 표지 → 인사말 → 캘린더/디데이 → 갤러리(스와이프) → 오시는 길 → 마음 전하실 곳 → 방명록 → 마무리
- 참석 여부 팝업 (스크롤 중 1회 자동 노출, 우측 하단 알약 버튼으로 재오픈 가능)
- 우측 상단 BGM on/off 토글 (음원 파일 연결 전 상태)

## 남은 작업

- `assets/cover.jpg` 외 갤러리용 실제 사진 교체
- `[ ]`로 표시된 이름/주소/계좌번호 placeholder 채우기
- 방명록·참석여부를 Google Sheets에 저장하려면 Google Apps Script 웹앱을 만들고 `index.html`의 `SHEET_ENDPOINT` 상수에 배포 URL을 넣으면 됩니다.
- BGM mp3 파일을 추가하고 `#bgmToggle` 클릭 핸들러에 `<audio>` 재생 로직 연결
