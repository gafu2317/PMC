import React, { useEffect, useState } from "react";
import {
  weekDays,
  timeSlots,
  slots,
  slotsKinjyou,
  isDuplicate,
} from "../../utils/utils";
import { Reservation } from "../../types/type";

interface ReservationDisplayProps {
  reservations: Reservation[]; // 予約情報
  selectedHours: boolean[][]; // 選択された時間帯
  selectedReservations: string[][][]; // 選択された予約
  onReservationClick: (dayIndex: number, timeIndex: number, id: string) => void; // 予約を選択したときのハンドラ
  isKinjyou?: boolean; // 金城かどうか
}

const ReservationDisplay: React.FC<ReservationDisplayProps> = ({
  reservations,
  selectedHours,
  selectedReservations,
  onReservationClick,
  isKinjyou,
}) => {
  const [isDuplicates, setIsDuplicates] = useState<boolean[][]>(
    Array.from({ length: 8 }, () => Array(12).fill(false))
  );
  const [hasReservations, setHasReservations] = Array(weekDays.length).fill(
    false
  );
  // 重複しているかどうかを判定
  useEffect(() => {
    setIsDuplicates(isDuplicate(reservations));
  }, [reservations]);
  // 予約があるかどうかを判定
  useEffect(() => {
    const newHasReservations = weekDays.map((_, dayIndex) => {
      return timeSlots.some((_, timeIndex) => {
        return (
          selectedHours[dayIndex][timeIndex] &&
          reservations.some(
            (reservation) =>
              reservation.dayIndex === dayIndex &&
              reservation.timeIndex === timeIndex
          )
        );
      });
    });
    setHasReservations(newHasReservations);
  }, [selectedHours, reservations]);

  return (
    <div>
      {weekDays.map((day, dayIndex) => {
        // 予約がない場合は何も表示しない
        if (!hasReservations) return null;
        return (
          <div key={day.date} className="mt-1">
            {/* 日付を表示 */}
            <h3 className="font-bold">{day.date}</h3>
            {timeSlots.map((_, timeIndex) => {
              // 選択された時間帯のみを考慮
              if (selectedHours[dayIndex][timeIndex]) {
                // 選択されている時間の予約のみを残す
                const selectedHourReservations = reservations.filter(
                  (reservation) =>
                    reservation.dayIndex === dayIndex &&
                    reservation.timeIndex === timeIndex
                );

                if (selectedHourReservations.length > 0) {
                  return (
                    <div key={timeIndex}>
                      {/* 時間を表示 */}
                      <div
                        className={`bg-gray-100 rounded-sm ${
                          isDuplicates[dayIndex][timeIndex] ? "bg-red-300" : ""
                        }`}
                      >
                        {isKinjyou ? slotsKinjyou[timeIndex] : slots[timeIndex]}
                        {isDuplicates[dayIndex][timeIndex]
                          ? "　　重複してます！"
                          : ""}
                      </div>
                      {selectedHourReservations.map((team, teamIndex) => {
                        // 予約が選択されているかどうか
                        const isSelected = selectedReservations[dayIndex][
                          timeIndex
                        ].includes(team.id);

                        return (
                          // チームを表示
                          <li
                            key={teamIndex}
                            className={`px-1 rounded ${
                              isSelected ? "bg-blue-100" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation(); // バブリングを防ぐ
                              onReservationClick(dayIndex, timeIndex, team.id);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {team.names.join(", ")}
                          </li>
                        );
                      })}
                    </div>
                  );
                }
              }
              return null; // 予約がない場合はnullを返す
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ReservationDisplay;
