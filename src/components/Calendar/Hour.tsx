// Hour.tsx
import React, { useState, useEffect } from "react";
import {
  timeSlots,
  timeSlotsKinjyou,
  timeEndSlots,
  timeEndSlotsKinjyou,
  useWeekDays,
} from "../../utils/utils";
import Swal from "sweetalert2";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { getReservationBanPeriod } from "../../firebase/userService";

interface HourProps {
  isUserReservation: boolean; // ユーザーの予約状況
  isDuplicate: boolean; // 重複フラグ
  dayIndex: number; // 日付のインデックス
  timeIndex: number; // 時間のインデックス
  isSelected: boolean; // クリックフラグ
  isReserved: boolean; // 予約フラグ
  onClick: () => void; // クリック時のハンドラ
  isKinjyou: boolean; // 金城フラグ
}

const Hour: React.FC<HourProps> = ({
  isUserReservation,
  isDuplicate,
  dayIndex,
  timeIndex,
  isSelected,
  isReserved,
  onClick,
  isKinjyou,
}) => {
  const weekDays = useWeekDays();
  const [banPeriods, setBanPeriods] = useState<
    { startDate: Date; endDate: Date; isKinjyou: Boolean }[]
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

  const reserveDate = weekDays[dayIndex]; //日付
  const reserveStartTime = isKinjyou
    ? timeSlotsKinjyou[timeIndex]
    : timeSlots[timeIndex]; //開始時間
  const reserveEndTime = isKinjyou
    ? timeEndSlotsKinjyou[timeIndex]
    : timeEndSlots[timeIndex]; //終了時間
  const reserveDateStartTime = new Date(
    reserveDate.year,
    reserveDate.month - 1,
    reserveDate.day,
    parseInt(reserveStartTime.split(":")[0], 10),
    parseInt(reserveStartTime.split(":")[1], 10)
  );
  const reserveDateEndTime = new Date(
    reserveDate.year,
    reserveDate.month - 1,
    reserveDate.day,
    parseInt(reserveEndTime.split(":")[0], 10),
    parseInt(reserveEndTime.split(":")[1], 10)
  );

  const isBan = banPeriods.some((period) => {
    return (
      reserveDateStartTime < period.endDate &&
      reserveDateEndTime > period.startDate &&
      period.isKinjyou === isKinjyou
    );
  });

  const handleClick = () => {
    if (isBan) {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "予約のできない時間帯です",
        confirmButtonText: "OK",
      });
      return;
    }
    onClick();
  };
  return (
    <div
      className={`flex items-center justify-center border-2 transition-all cursor-pointer ${
        isSelected ? "border-red-500" : "border-gray-300"
      } ${
        isBan
          ? "bg-black"
          : isReserved
          ? isUserReservation
            ? "bg-green-500"
            : "bg-gray-300"
          : ""
      } ${isDuplicate ? "bg-red-300" : ""}`}
      style={{ aspectRatio: 1 }}
      onClick={handleClick} // クリック時にハンドラを呼び出す
    ></div>
  );
};

export default Hour;
