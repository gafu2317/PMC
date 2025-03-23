import React, { useState, useEffect, ChangeEvent } from "react";
import {
  setReservationBanPeriod,
  getReservationBanPeriod,
  deleteReservationBanPeriod,
} from "../../firebase/userService";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Reservation } from "../../types/type";



const BanPeriods = () => {
  const [newStartDate, setNewStartDate] = useState<Date | null>(null);
  const [newEndDate, setNewEndDate] = useState<Date | null>(null);
  const [banPeriods, setBanPeriods] = useState<
    { startDate: Date; endDate: Date }[]
  >([]);
  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const localDate = new Date(e.target.value); // 入力されたローカル日時を取得
    setNewStartDate(localDate); // ローカルタイムのまま保存
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const localDate = new Date(e.target.value); // 入力されたローカル日時を取得
    setNewEndDate(localDate); // ローカルタイムのまま保存
  };
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
    if (!newStartDate || !newEndDate) return;
    if (newStartDate >= newEndDate) {
      console.error("終了日時は開始日時より後にしてください。");
      return;
    }
    //
    await setReservationBanPeriod(newStartDate, newEndDate);
    setNewStartDate(null);
    setNewEndDate(null);
  };
  const handleDelete = async (startDate: Date, endDate: Date) => {
    await deleteReservationBanPeriod(startDate, endDate);
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
        {banPeriods.map((period, index) => (
          <li key={index} className="flex justify-between items-center mb-2">
            <div>
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
              onClick={() => handleDelete(period.startDate, period.endDate)}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
      <h2 className="flex justify-center items-center mb-2 text-lg">
        予約禁止期間を設定
      </h2>
      <div className="mb-2">
        <div className="mb-2">
          <label className="block">開始日時:</label>
          <input
            className="border rounded p-1 w-full"
            type="datetime-local"
            value={formatDateForInput(newStartDate)}
            onChange={handleStartDateChange}
          />
        </div>
        <div className="mb-2">
          <label className="block">終了日時:</label>
          <input
            className="border rounded p-1 w-full"
            type="datetime-local"
            value={formatDateForInput(newEndDate)}
            onChange={handleEndDateChange}
          />
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
