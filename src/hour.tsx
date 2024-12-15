// Hour.tsx
import React from "react";

interface HourProps {
  isSelected: boolean; // クリックフラグ
  name: string; // 予約者名
  onClick: () => void; // クリック時のハンドラ
}

const Hour: React.FC<HourProps> = ({ isSelected, name, onClick }) => {
  return (
    <div
      className={`flex items-center justify-center p-2 border ${
        isSelected ? "border-red-500" : "border-gray-300"
      } hover:border-red-500 transition-all cursor-pointer`}
      onClick={onClick} // クリック時にハンドラを呼び出す
    >
      <span className={`text-xs ${name ? "text-gray-700" : "text-black"}`}>
        {name ? "×" : "⚪︎"}{" "}
        {/* 予約されている場合は「予約あり」を表示 */}
      </span>
    </div>
  );
};

export default Hour;
