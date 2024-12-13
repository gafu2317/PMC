// Hour.tsx
import React from "react";

interface HourProps {
  isSelected: boolean; // クリックフラグ
  isReserved: boolean; // 予約状態
  onClick: () => void; // クリック時のハンドラ
}

const Hour: React.FC<HourProps> = ({ isSelected, isReserved, onClick }) => {
  return (
    <div
      className={`p-2 border ${
        isSelected ? "border-gray-500" : "border-transparent"
      } hover:border-gray-500 transition-all cursor-pointer`}
      onClick={onClick} // クリック時にハンドラを呼び出す
    >
      {isReserved ? "×" : "⚪︎"} {/* 予約されている場合は「×」を表示 */}
    </div>
  );
};

export default Hour;
