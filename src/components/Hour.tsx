// Hour.tsx
import React from "react";
import { getDayIndex } from "../utils/utils";

interface HourProps {
  dayIndex: number; // 日付のインデックス
  timeIndex: number; // 時間のインデックス
  isSelected: boolean; // クリックフラグ
  isReserved: boolean; // 予約フラグ
  onClick: () => void; // クリック時のハンドラ
}

const Hour: React.FC<HourProps> = ({ isSelected, isReserved, onClick, dayIndex, timeIndex }) => {
  return (
    <div
      className={`flex items-center justify-center p-2 border ${
        isSelected ? "border-red-500" : "border-gray-300"
      } transition-all cursor-pointer ${
        isSelected ? "" : "hover:border-gray-300" 
      }`}
      onClick={onClick} // クリック時にハンドラを呼び出す
    >
      <span className={`text-xs ${isReserved ? "text-gray-700" : "text-black"}`}>
        {isReserved ? "×" : "⚪︎"}{" "}
        {/* {dayIndex}日目{timeIndex}時間目 */}
      </span>
    </div>
  );
};

export default Hour;
