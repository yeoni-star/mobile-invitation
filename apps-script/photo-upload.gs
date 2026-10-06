// Apps Script(Code.gs)에 추가하는 하객 사진 업로드 코드.
// 1) 아래 함수들을 Code.gs 맨 아래에 붙여넣기
// 2) doPost 안에서 `var body = JSON.parse(e.postData.contents);` 바로 다음 줄에 아래 두 줄 추가
//      if (body.type === "photo") { return handlePhotoUpload(body); }
// 3) setupPhotoFolder 함수를 한 번 실행(Drive 권한 승인 + 폴더 생성)
// 4) 배포 > 배포 관리 > 수정 > 새 버전 > 배포

var PHOTO_FOLDER_NAME = "결혼식 하객 사진";

function getPhotoFolder() {
  var it = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER_NAME);
}

function setupPhotoFolder() {
  Logger.log(getPhotoFolder().getUrl());
}

function handlePhotoUpload(body) {
  var out = function (obj) {
    return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  };
  if (!body.data || body.data.length > 8000000) {
    return out({ ok: false, error: "invalid size" });
  }
  var safeName = String(body.name || "익명").replace(/[\\\/:*?"<>|]/g, "").slice(0, 20) || "익명";
  var stamp = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyyMMdd_HHmmss");
  var fileName = stamp + "_" + safeName + "_" + (parseInt(body.index, 10) || 1) + ".jpg";
  var blob = Utilities.newBlob(Utilities.base64Decode(body.data), "image/jpeg", fileName);
  getPhotoFolder().createFile(blob);
  return out({ ok: true });
}
