document.addEventListener("DOMContentLoaded", function () {
  const liffId = "2006484950-vkz1MmLe"; // LIFF IDをここに入力
  initializeLiff(liffId);
});

//liffの初期化
function initializeLiff(liffId) {
  liff
    .init({
      liffId: liffId,
    })
    .then(() => {
      initializeApp();
    })
    .catch((err) => {
      console.log("LIFF Initialization failed ", err);
    });
}

function sendText(text) {
  liff
    .sendMessages([{ type: "text", text: text }])
    .then(function () {
      liff.closeWindow();
    })
    .catch(function (error) {
      window.alert("Failed to send message " + error);
    });
}

document
  .getElementById("reservationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // フォームのデフォルトの送信を防ぐ

    const nameType = document.querySelector('input[name="nameType"]:checked');

    // ラジオボタンのvalueを取得
    const nameTypeValue = nameType ? nameType.value : "";
    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    const msg = `予約削除\n${nameTypeValue}\n${name}\n${date}\n${time}`;
    sendText(msg);
  });
