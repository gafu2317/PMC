// twoWeekBooking.tsx
import React from "react";
import { useBooking } from "../../context/BookingContext"; // コンテキストをインポート

const TwoWeekBooking: React.FC = () => {
  const { isTwoWeekBookingEnabled, toggleTwoWeekBooking } = useBooking(); // コンテキストから状態を取得

  return (
    <div>
      <div className="my-2 flex justify-center">
        <button
          onClick={toggleTwoWeekBooking}
          className={`text-white rounded p-2 ${
            isTwoWeekBookingEnabled ? "bg-green-500" : "bg-blue-500"
          }`} // 状態に応じて色を変更
        >
          {isTwoWeekBookingEnabled
            ? "1週間予約にする"
            : "2週間予約を可能にする"}
        </button>
      </div>
    </div>
  );
};

export default TwoWeekBooking;
