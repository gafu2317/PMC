const LINE_TOKEN = 'St81k+VUnbPE23IeeYVJVZIWQm8oTfpVDk6hhIi/cj7yJVHGWHUsApb7pCIQiMAvItrxTpK8wviAvlSx+6fgYT/Q03aOjhlJwl7VbPa4Bzy+pR/6Sv5kkm9ywjyvOFbbE56vo2WHac+g5uFKOpPN4AdB04t89/1O/w1cDnyilFU=';
const SHEET_ID = '1jkJ9mrVPMF_nDomnP2YVcmT1tvjay6_vG3EGGBuwdaQ'; // スプレッドシートのIDを入力

// function testDoPost() {
//   Logger.log("testDoPost");
//   const testEvent = {
//     postData: {
//       contents: JSON.stringify({
//         events: [{
//           replyToken: 'dummyToken',
//           message: { text: 'テストメッセージ' }
//         }]
//       })
//     }
//   };
//   doPost(testEvent);
// }


function doPost(e) {
  Logger.log("doPost function called"); // 関数が呼ばれたことを確認
  const json = JSON.parse(e.postData.contents);
  Logger.log("Received event: " + JSON.stringify(json)); // イベントの内容をログに出力

  const replyToken = json.events[0].replyToken;
  const message = json.events[0].message.text;

  // スプレッドシートにメッセージを記録
  Logger.log("Message received: " + message);
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('pmc');
  sheet.appendRow([new Date(), message]);

  // 返信内容を設定
  const replyMessage = {
    "replyToken": replyToken,
    "messages": [{
      "type": "text",
      "text": `あなたが送ったメッセージ: ${message}`
    }]
  };

  const options = {
    "method": "post",
    "headers": {
      "Authorization": `Bearer ${LINE_TOKEN}`,
      "Content-Type": "application/json"
    },
    "payload": JSON.stringify(replyMessage)
  };

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', options);
  return ContentService.createTextOutput(JSON.stringify({ "status": "success" })).setMimeType(ContentService.MimeType.JSON);
}
