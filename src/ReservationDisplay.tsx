import React from "react";

interface ReservationDisplayProps {
  weekDays: { date: string }[];
  reservedNames: string[][][][];
  selectedHours: boolean[][]; // 追加: 選択された時間帯の情報
  timeSlots: string[];
}

const ReservationDisplay: React.FC<ReservationDisplayProps> = ({
  weekDays,
  reservedNames,
  selectedHours,
  timeSlots,
}) => {
  return (
    <div>
      {weekDays.map((day, colIndex) => {
        const reservations = timeSlots
          .map((time, rowIndex) => {
            // 選択された時間帯のみを考慮
            if (selectedHours[rowIndex][colIndex]) {
              const teams = reservedNames[rowIndex][colIndex];
              if (teams.length > 0) {
                return { time, teams }; // 時間とチームメンバーを含むオブジェクト
              }
            }
            return null; // 予約がない場合はnullを返す
          })
          .filter(Boolean); // nullを除外

        if (reservations.length > 0) {
          return (
            <div key={day.date} className="mt-1">
              <h3 className="font-bold">{day.date}</h3>
              {reservations.map((reservation, index) => {
                if (reservation) {
                  return (
                    <div key={index}>
                      <div>{reservation.time}</div>
                      {reservation.teams.map((team, teamIndex) => (
                        <li key={teamIndex}>
                          {" "}
                          {team.join(", ")} {/* チームメンバーを表示 */}
                        </li>
                      ))}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          );
        }
        return null; // reservationsが空の場合はnullを返す
      })}
    </div>
  );
};

export default ReservationDisplay;
