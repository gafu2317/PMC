// Hour.tsx
import React from "react";

interface HourProps {
  isUserReservation: boolean; // ユーザーの予約状況
  dayIndex: number; // 日付のインデックス
  timeIndex: number; // 時間のインデックス
  isSelected: boolean; // クリックフラグ
  isReserved: boolean; // 予約フラグ
  onClick: () => void; // クリック時のハンドラ
}

const Hour: React.FC<HourProps> = ({
  isUserReservation, 
  isSelected,
  isReserved,
  onClick,
}) => {
  return (
    <div
      className={`flex items-center justify-center p-2  ${
        isSelected ? "border-2 border-red-500" : "border-2 border-gray-300"
      } transition-all cursor-pointer ${
        isReserved ? (isUserReservation ? "" : "bg-gray-300") : ""
      } `}
      onClick={onClick} // クリック時にハンドラを呼び出す
    >
      <div className="flex justify-center items-center">
        {isReserved ? isUserReservation ? "🟢" : "　" : "　"}
      </div>
    </div>
  );
};

export default Hour;
