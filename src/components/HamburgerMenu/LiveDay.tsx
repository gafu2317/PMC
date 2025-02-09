import React, { useState, useEffect } from "react";
import { setLiveDay1, setLiveDay2 } from "../../firebase/userService";
import Swal from "sweetalert2";
import { db } from "../../firebase/firebase"; // Firestoreのインポート
import { doc, onSnapshot } from "firebase/firestore";

interface LiveDayProps {}

const LiveDay: React.FC<LiveDayProps> = () => {
  const [liveDay1Locale, setLiveDay1Locale] = useState<Date | undefined>(
    undefined
  );
  const [liveDay2Locale, setLiveDay2Locale] = useState<Date | undefined>(
    undefined
  );
  const [liveDay1, setLiveDay1db] = useState<Date | undefined>(undefined);
  const [liveDay2, setLiveDay2db] = useState<Date | undefined>(undefined);

  // Firestoreからライブ日をリアルタイムで取得
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "setting", "liveDays"), (doc) => {
      const data = doc.data();
      if (data) {
        if (data.liveDay1) {
          setLiveDay1db(new Date(data.liveDay1.toDate())); // 次のライブ日
        }
        if (data.liveDay2) {
          setLiveDay2db(new Date(data.liveDay2.toDate())); // 前回のライブ日
        }
      }
    });
    return () => unsubscribe(); // クリーンアップ
  }, []);

  const handleSubmit = async () => {
    if (!liveDay1Locale || !liveDay2Locale) {
      Swal.fire({
        icon: "error",
        title: "日付を入力してください",
      });
      return;
    }
    await setLiveDay1(liveDay1Locale);
    await setLiveDay2(liveDay2Locale);
    Swal.fire({
      icon: "success",
      title: "ライブ日を変更しました",
    });
  };

  const handleDateChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setLiveDay1Locale(new Date(selectedDate)); // 次のライブ日を更新
  };

  const handleDateChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setLiveDay2Locale(new Date(selectedDate)); // 前回のライブ日を更新
  };

  return (
    <div>
      <h2 className="mb-2">ライブ日を変更</h2>
      <h3 className="text-xs">
        現在の次回のライブ日:{" "}
        {liveDay1 ? liveDay1.toLocaleDateString() : "読み込み中..."}
      </h3>
      <h3 className="text-xs">
        現在の前回のライブ日:{" "}
        {liveDay2 ? liveDay2.toLocaleDateString() : "読み込み中..."}
      </h3>
      <div className="flex justify-between items-center">
        <label htmlFor="laveDay1">次回のライブの日</label>
        <input
          id="laveDay1"
          className="border rounded p-1 my-2 "
          type="date"
          value={
            liveDay1Locale ? liveDay1Locale.toISOString().split("T")[0] : ""
          }
          onChange={handleDateChange1}
        />
      </div>
      <div className="flex justify-between items-center">
        <label htmlFor="laveDay2">前回のライブの日</label>
        <input
          id="laveDay2"
          className="border rounded p-1 my-2"
          type="date"
          value={
            liveDay2Locale ? liveDay2Locale.toISOString().split("T")[0] : ""
          }
          onChange={handleDateChange2}
        />
      </div>
      <div className="flex justify-end">
        <button
          className="bg-blue-500 text-white rounded p-1"
          onClick={handleSubmit}
        >
          変更
        </button>
      </div>
    </div>
  );
};

export default LiveDay;
