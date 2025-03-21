import React from "react";
import { useState, useEffect } from "react";
import { Reservation } from "../../types/type";
import {
  useWeekDays,
  daysOfWeek,
  timeSlots,
  slotsKinjyou,
  isDuplicate,
  timeSlotsKinjyou,
} from "../../utils/utils";
import Hour from "./Hour";

interface CalendarProps {
  name: string;
  reservations: Reservation[];
  selectedHours: boolean[][];
  onHourClick: (dayIndex: number, timeIndex: number) => void;
  isKinjyou?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  name,
  reservations,
  selectedHours,
  onHourClick,
  isKinjyou,
}) => {
  const weekDays = useWeekDays();
  const [reservedHours, setReservedHours] = useState<boolean[][]>(
    Array.from({ length: 8 }, () => Array(12).fill(false)) // 8日間、12時間の初期状態を設定
  );
  // reservationsが更新されるたびにreservedHoursを更新
  useEffect(() => {
    // reservedHoursの更新
    const updatedReservedHours = Array.from({ length: 8 }, () =>
      Array(12).fill(false)
    ); // 予約の状態をリセット
    reservations.forEach((reservation) => {
      updatedReservedHours[reservation.dayIndex][reservation.timeIndex] = true; // 予約がある場合はtrueを設定
    });
    setReservedHours(updatedReservedHours); // 状態を更新
  }, [reservations]); // reservationsが変更されたときに実行

  const [isUserReservations, setIsUserReservations] = useState<boolean[][]>(
    Array.from({ length: 8 }, () => Array(12).fill(false)) // 8日間、12時間の初期状態を設定
  );
  useEffect(() => {
    const updatedIsUserReservations = Array.from({ length: 8 }, () =>
      Array(12).fill(false)
    ); // 予約の状態をリセット
    reservations.forEach((reservation) => {
      if (reservation.names.includes(name)) {
        updatedIsUserReservations[reservation.dayIndex][reservation.timeIndex] =
          true; // 予約がある場合はtrueを設定
      }
    });
    setIsUserReservations(updatedIsUserReservations); // 状態を更新
  }, [reservations, name]); // reservationsが変更されたときに実行

  const [isDuplicates, setIsDuplicates] = useState<boolean[][]>(
    Array.from({ length: 8 }, () => Array(12).fill(false))
  );
  useEffect(() => {
    setIsDuplicates(isDuplicate(reservations));
  }, [reservations]);

  return (
    <div>
      {isKinjyou ? (
        <div className="flex space-x-1">
          {/* <div className="flex flex-col justify-between">
              <div className="h-8"></div>
              {Array.from({ length: timeSlotsKinjyou.length }).map(
                (_, index) => (
                  <div key={index} className="text-center p-1 text-xs rounded">
                    {slotsKinjyou[index]}
                    <br />
                  </div>
                )
              )}
            </div> */}
          <div className="grid grid-cols-9 gap-2 mb-4">
            <div className="text-center p-1 text-xs rounded"></div>
            {weekDays.map((item, index) => (
              <div
                key={index}
                className={`text-center p-1 text-xs rounded ${
                  new Date().getDate() === item.day
                    ? "bg-yellow-200"
                    : "bg-gray-200"
                }`}
              >
                {daysOfWeek[index]}
                <br />
                {item.date}
              </div>
            ))}
            {Array.from({ length: timeSlotsKinjyou.length }).map(
              (_, timeIndex) => (
                <React.Fragment key={timeIndex}>
                  <div className="flex items-center justify-center">
                    <div className="text-xs ">{slotsKinjyou[timeIndex]}</div>
                  </div>
                  {Array.from({ length: daysOfWeek.length }).map(
                    (_, dayIndex) => (
                      <Hour
                        isUserReservation={
                          isUserReservations[dayIndex][timeIndex]
                        }
                        isDuplicate={isDuplicates[dayIndex][timeIndex]}
                        dayIndex={dayIndex}
                        timeIndex={timeIndex}
                        key={`hour-${dayIndex}-${timeIndex}`}
                        isSelected={selectedHours[dayIndex][timeIndex]}
                        isReserved={reservedHours[dayIndex][timeIndex]}
                        onClick={() => onHourClick(dayIndex, timeIndex)}
                      />
                    )
                  )}
                </React.Fragment>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="flex space-x-1">
          <div className="flex flex-col justify-between">
            <div className="h-5"></div>
            {Array.from({ length: timeSlots.length }).map((_, index) => (
              <div key={index} className="text-center p-1 text-xs rounded">
                {timeSlots[index]}
                <br />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-8 gap-2 mb-4">
            {weekDays.map((item, index) => (
              <div
                key={index}
                className={`text-center p-1 text-xs rounded ${
                  new Date().getDate() === item.day
                    ? "bg-yellow-200"
                    : "bg-gray-200"
                }`}
              >
                {daysOfWeek[index]}
                <br />
                {item.date}
              </div>
            ))}
            {Array.from({ length: timeSlots.length - 1 }).map(
              (_, timeIndex) => (
                <React.Fragment key={timeIndex}>
                  {Array.from({ length: daysOfWeek.length }).map(
                    (_, dayIndex) => (
                      <Hour
                        isUserReservation={
                          isUserReservations[dayIndex][timeIndex]
                        }
                        isDuplicate={isDuplicates[dayIndex][timeIndex]}
                        dayIndex={dayIndex}
                        timeIndex={timeIndex}
                        key={`hour-${dayIndex}-${timeIndex}`}
                        isSelected={selectedHours[dayIndex][timeIndex]}
                        isReserved={reservedHours[dayIndex][timeIndex]}
                        onClick={() => onHourClick(dayIndex, timeIndex)}
                      />
                    )
                  )}
                </React.Fragment>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
