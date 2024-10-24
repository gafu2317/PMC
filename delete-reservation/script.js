document.addEventListener("DOMContentLoaded", function () {
  const liffId = "2006484950-WLVJM5vB"; // LIFF IDをここに入力
  initializeLiff(liffId);
});

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
    .sendMessages([
      {
        type: "text",
        text: text,
      },
    ])
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
    event.preventDefault(); // デフォルトのフォーム送信を防ぐ

    const nameType = document.querySelector(
      'input[name="nameType"]:checked'
    ).value; // 選択された名前の種類を取得
    const name = document.getElementById("name").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    const msg = `${
      nameType === "individual" ? "個人名" : "グループ名"
    }\n${name}\n${date}\n${time}`;
    sendText(msg);
  });
