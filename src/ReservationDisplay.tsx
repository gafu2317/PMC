import React from "react";

interface ReservationDisplayProps {
  weekDays: { date: string }[];
  reservedNames: string[][][][];
  selectedHours: boolean[][]; // 選択された時間帯の情報
  timeSlots: string[];
  selectedReservations: {
    dayIndex: number;
    timeIndex: number;
    teamIndex: number;
  }[]; // 選択された予約情報
  onReservationSelect: (reservation: {
    dayIndex: number;
    timeIndex: number;
    teamIndex: number;
  }) => void; // チーム選択のハンドラ
}

const ReservationDisplay: React.FC<ReservationDisplayProps> = ({
  weekDays,
  reservedNames,
  selectedHours,
  timeSlots,
  selectedReservations,
  onReservationSelect,
}) => {
  return (
    <div>
      {weekDays.map((day, colIndex) => {
        const hasReservations = timeSlots.some((_, rowIndex) => {
          // 選択された時間帯で予約があるか確認
          return (
            selectedHours[rowIndex][colIndex] &&
            reservedNames[rowIndex][colIndex].length > 0
          );
        });

        // 予約がない場合は何も表示しない
        if (!hasReservations) return null;

        return (
          <div key={day.date} className="mt-1">
            <h3 className="font-bold">{day.date}</h3>
            {timeSlots.map((time, rowIndex) => {
              // 選択された時間帯のみを考慮
              if (selectedHours[rowIndex][colIndex]) {
                const teams = reservedNames[rowIndex][colIndex];
                if (teams.length > 0) {
                  return (
                    <div key={rowIndex}>
                      <div className="bg-gray-100 rounded-sm">
                        {time}~{timeSlots[rowIndex + 1]}
                      </div>
                      {teams.map((team, teamIndex) => {
                        const isSelected = selectedReservations.some(
                          (reservation) =>
                            reservation.dayIndex === colIndex &&
                            reservation.timeIndex === rowIndex &&
                            reservation.teamIndex === teamIndex
                        );

                        return (
                          <li
                            key={teamIndex}
                            className={
                              isSelected
                                ? "border border-black rounded-sm"
                                : "border border-white"
                            }
                            onClick={() => {
                              const reservationInfo = {
                                dayIndex: colIndex,
                                timeIndex: rowIndex,
                                teamIndex: teamIndex,
                              };
                              onReservationSelect(reservationInfo);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {team.join(", ")} {/* チームメンバーを表示 */}
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
