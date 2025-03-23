import { useState, useEffect } from "react";
import {
  setReservationBanPeriod,
  getReservationBanPeriod,
  deleteReservationBanPeriod,
} from "../../firebase/userService";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface BanPeriodsProps {}

const BanPeriods: React.FC<BanPeriodsProps> = () => {
  const [newStartDate, setNewStartDate] = useState<Date | null>(null);
  const [newEndDate, setNewEndDate] = useState<Date | null>(null);
  const [newIsKinjyou, setNewIsKinjyou] = useState<boolean | null>(null);
  const [banPeriods, setBanPeriods] = useState<
    { startDate: Date; endDate: Date; isKinjyou: boolean }[]
  >([]);
  useEffect(() => {
    const collectionRef = collection(db, "setting");
    const unsubscribe = onSnapshot(collectionRef, async () => {
      try {
        const periods = await getReservationBanPeriod();
        if (periods) {
          setBanPeriods(periods);
        } else {
          console.warn("予約禁止期間が取得できませんでした。");
        }
      } catch (error) {
        console.error("予約禁止期間の取得に失敗しました:", error);
      }
    });
    return () => unsubscribe();
  }, []);
  const handleSet = async () => {
    if (!newStartDate || !newEndDate || newIsKinjyou === null) {
      console.error("日時を入力してください。");
      console.log(newStartDate, newEndDate, newIsKinjyou);
      return;
    }
    if (newStartDate >= newEndDate) {
      console.error("終了日時は開始日時より後にしてください。");
      return;
    }
    //
    await setReservationBanPeriod(newStartDate, newEndDate, newIsKinjyou);
    setNewStartDate(null);
    setNewEndDate(null);
    setNewIsKinjyou(null);
  };
  const handleDelete = async (
    startDate: Date,
    endDate: Date,
    isKinjyou: boolean
  ) => {
    await deleteReservationBanPeriod(startDate, endDate, isKinjyou);
  };
  // 日付を "yyyy-MM-ddTHH:mm" 形式に変換するヘルパー関数
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 月は0から始まるため +1
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`; // フォーマットを整形
  };
  return (
    <div>
      <div className="flex justify-center items-center">
        <h2 className="mb-2 text-lg">予約禁止期間</h2>
      </div>
      <ul className="mb-2">
        {banPeriods.length === 0 ? (
          <li className="text-center">なし</li>
        ) : (
          banPeriods.map((period, index) => (
            <li key={index} className="flex justify-between items-center mb-2">
              <div>
                <div className="font-bold">
                  {period.isKinjyou ? "金城" : "名工"}
                </div>
                <div>
                  {period.startDate.toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false, // 24時間形式
                  })}
                </div>
                <div>
                  〜{" "}
                  {period.endDate.toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false, // 24時間形式
                  })}
                </div>
              </div>
              <button
                className="text-red-500 border border-red-500 rounded p-1"
                onClick={() =>
                  handleDelete(
                    period.startDate,
                    period.endDate,
                    period.isKinjyou
                  )
                }
              >
                削除
              </button>
            </li>
          ))
        )}
      </ul>

      <h2 className="flex justify-center items-center my-2 text-lg">
        予約禁止期間を設定
      </h2>
      <div className="mb-2">
        <div className="mb-2">
          <label className="block">開始日時:</label>
          <input
            className="border rounded p-1 w-full"
            type="datetime-local"
            value={formatDateForInput(newStartDate)}
            onChange={(e) => setNewStartDate(new Date(e.target.value))}
          />
        </div>
        <div className="mb-2">
          <label className="block">終了日時:</label>
          <input
            className="border rounded p-1 w-full"
            type="datetime-local"
            value={formatDateForInput(newEndDate)}
            onChange={(e) => setNewEndDate(new Date(e.target.value))}
          />
        </div>
        <div className="mb-2 flex justify-around">
          <div>
            <label>名工学スタ:</label>
            <input
              className="border rounded p-1 ml-2"
              type="checkbox"
              checked={newIsKinjyou === null ? false : !newIsKinjyou} // nullの場合はチェックなし
              onChange={(e) => setNewIsKinjyou(!e.target.checked)}
            />
          </div>
          <div>
            <label>金城学スタ:</label>
            <input
              className="border rounded p-1 ml-2"
              type="checkbox"
              checked={newIsKinjyou === null ? false : newIsKinjyou} // nullの場合はチェックなし
              onChange={(e) => setNewIsKinjyou(e.target.checked)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          className="bg-blue-500 text-white rounded p-1"
          onClick={handleSet}
        >
          設定
        </button>
      </div>
    </div>
  );
};

export default BanPeriods;
