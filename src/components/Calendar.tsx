import React from 'react'
import { useState, useEffect } from 'react'
import { Reservation } from '../types/type'
import { weekDays, daysOfWeek, timeSlots } from '../utils/utils'
import Hour from './Hour'

interface CalendarProps {
  reservations: Reservation[];
  selectedHours: boolean[][];
  onHourClick: (dayIndex: number, timeIndex: number) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  reservations,
  selectedHours,
  onHourClick,
}) => {

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

  return (
    <div>
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
              className="text-center bg-gray-200 p-1 text-xs rounded"
            >
              {daysOfWeek[index]}
              <br />
              {item.date}
            </div>
          ))}
          {Array.from({ length: daysOfWeek.length }).map((_, dayIndex) => (
            <React.Fragment key={dayIndex}>
              {Array.from({ length: timeSlots.length -1 }).map((_, timeIndex) => (
                <Hour
                  key={timeIndex}
                  isSelected={selectedHours[dayIndex][timeIndex]}
                  isReserved={reservedHours[dayIndex][timeIndex]}
                  onClick={() => onHourClick(dayIndex, timeIndex)}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Calendar