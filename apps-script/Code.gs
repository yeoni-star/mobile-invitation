// Google Apps Script 전체 코드 (구글 시트 > 확장 프로그램 > Apps Script 의 Code.gs 에 통째로 붙여넣기)
// 코드를 바꾼 뒤에는 반드시: 배포 > 배포 관리 > 수정(연필) > 버전: 새 버전 > 배포

var PHOTO_FOLDER_NAME = "결혼식 하객 사진";
var DRIVE_UPLOAD_PREFIX = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=";

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (action === "guestbook") {
    var sheet = ss.getSheetByName("Guestbook");
    var rows = sheet.getDataRange().getValues();
    rows.shift();
    var data = rows.reverse().map(function (r) {
      return { timestamp: r[0], name: r[1], message: r[2] };
    });
    return jsonOut({ ok: true, data: data });
  }
  if (action === "accounts") {
    var sheet = ss.getSheetByName("Accounts");
    var rows = sheet.getDataRange().getValues();
    rows.shift();
    var data = rows.map(function (r) {
      return { side: r[0], role: r[1], name: r[2], account: r[3] };
    });
    return jsonOut({ ok: true, data: data });
  }
  return jsonOut({ ok: false, error: "unknown action" });
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  if (body.type === "photo") { return handlePhotoUpload(body); }
  if (body.type === "video_start") { return handleVideoStart(body); }
  if (body.type === "video_chunk") { return handleVideoChunk(body); }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (body.type === "guestbook") {
    var sheet = ss.getSheetByName("Guestbook");
    sheet.appendRow([new Date(), body.name, body.message]);
  } else if (body.type === "rsvp") {
    var sheet = ss.getSheetByName("RSVP");
    sheet.appendRow([new Date(), body.attend, body.count || "", body.meal || ""]);
  } else {
    return jsonOut({ ok: false, error: "unknown type" });
  }
  return jsonOut({ ok: true });
}

function getPhotoFolder() {
  var it = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER_NAME);
}

// 에디터에서 한 번 실행해서 Drive/외부 요청 권한을 승인하는 용도
function setupPhotoFolder() {
  Logger.log(getPhotoFolder().getUrl());
  UrlFetchApp.fetch("https://www.googleapis.com/discovery/v1/apis?name=drive", { muteHttpExceptions: true });
}

function uploadFileName(body, ext) {
  var safeName = String(body.name || "익명").replace(/[\\\/:*?"<>|]/g, "").slice(0, 20) || "익명";
  var stamp = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyyMMdd_HHmmss");
  return stamp + "_" + safeName + "_" + (parseInt(body.index, 10) || 1) + ext;
}

function handlePhotoUpload(body) {
  if (!body.data || body.data.length > 8000000) {
    return jsonOut({ ok: false, error: "invalid size" });
  }
  var blob = Utilities.newBlob(Utilities.base64Decode(body.data), "image/jpeg", uploadFileName(body, ".jpg"));
  getPhotoFolder().createFile(blob);
  return jsonOut({ ok: true });
}

function videoExtension(body) {
  var m = String(body.filename || "").match(/\.(mp4|mov|m4v|webm|3gp|avi|mkv)$/i);
  if (m) return "." + m[1].toLowerCase();
  if (/quicktime/i.test(body.mime || "")) return ".mov";
  if (/webm/i.test(body.mime || "")) return ".webm";
  return ".mp4";
}

function handleVideoStart(body) {
  var size = parseInt(body.size, 10);
  if (!size || size > 110 * 1024 * 1024) {
    return jsonOut({ ok: false, error: "invalid size" });
  }
  var res = UrlFetchApp.fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
    method: "post",
    contentType: "application/json; charset=UTF-8",
    headers: {
      Authorization: "Bearer " + ScriptApp.getOAuthToken(),
      "X-Upload-Content-Type": body.mime || "video/mp4",
      "X-Upload-Content-Length": String(size)
    },
    payload: JSON.stringify({
      name: uploadFileName(body, videoExtension(body)),
      parents: [getPhotoFolder().getId()]
    }),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) {
    return jsonOut({ ok: false, error: "start failed " + res.getResponseCode() });
  }
  var headers = res.getAllHeaders();
  var session = headers["Location"] || headers["location"];
  return jsonOut({ ok: true, session: session });
}

function handleVideoChunk(body) {
  if (!body.session || String(body.session).indexOf(DRIVE_UPLOAD_PREFIX) !== 0) {
    return jsonOut({ ok: false, error: "bad session" });
  }
  var bytes = Utilities.base64Decode(body.data);
  var start = parseInt(body.start, 10);
  var total = parseInt(body.total, 10);
  var end = start + bytes.length - 1;
  var res = UrlFetchApp.fetch(body.session, {
    method: "put",
    contentType: "application/octet-stream",
    headers: {
      Authorization: "Bearer " + ScriptApp.getOAuthToken(),
      "Content-Range": "bytes " + start + "-" + end + "/" + total
    },
    payload: bytes,
    followRedirects: false,
    muteHttpExceptions: true
  });
  var code = res.getResponseCode();
  if (code === 200 || code === 201) return jsonOut({ ok: true, done: true });
  if (code === 308) return jsonOut({ ok: true, done: false });
  return jsonOut({ ok: false, error: "chunk failed " + code });
}
