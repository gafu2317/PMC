import React from "react";
import { weekDays, timeSlots } from "../utils/utils";
import { Reservation } from "../types/type";

interface ReservationDisplayProps {
  reservations: Reservation[]; // 予約情報
  selectedHours: boolean[][]; // 選択された時間帯
  selectedReservations: string[][][]; // 選択された予約
  onReservationClick: (dayIndex: number, timeIndex: number, id: string) => void; // 予約を選択したときのハンドラ
}

const ReservationDisplay: React.FC<ReservationDisplayProps> = ({
  reservations,
  selectedHours,
  selectedReservations,
  onReservationClick,
}) => {
  return (
    <div>
      {weekDays.map((day, dayIndex) => {
        // 時間が選択されているかつ予約があるかどうか
        const hasReservations = timeSlots.some((_, timeIndex) => {
          return (
            selectedHours[dayIndex][timeIndex] &&
            reservations.some(
              (reservation) =>
                reservation.dayIndex === dayIndex &&
                reservation.timeIndex === timeIndex
            )
          );
        });
        // 予約がない場合は何も表示しない
        if (!hasReservations) return null;

        return (
          <div key={day.date} className="mt-1">
            {/* 日付を表示 */}
            <h3 className="font-bold">{day.date}</h3>
            {timeSlots.map((time, timeIndex) => {
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
                      <div className="bg-gray-100 rounded-sm">
                        {time}~{timeSlots[timeIndex + 1]}
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
                            className={`px-1 rounded hover:bg-blue-100 ${
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
