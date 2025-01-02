import React from 'react'
import { useState } from 'react'
import { Reservations } from './types/type'

interface CalendarProps {
    reservations: [Reservations]
  }

const Calendar: React.FC<CalendarProps> = ({
  

}) => {

    const today = new Date();
    const currentDay = today.getDay();
    const daysOfWeek = ["月", "火", "水", "木", "金", "土", "日", "月"];

    const weekDays = Array.from({ length: 8 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - currentDay + index + 1);
      return { date: `${date.getMonth() + 1}/${date.getDate()}` };
    });

    const timeSlots = [
      "9:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:30",
    ];
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
          {/* {Array.from({ length: timeSlots.length - 1 }).map((_, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {Array.from({ length: daysOfWeek.length }).map((_, colIndex) => (
                <Hour
                  key={colIndex}
                  isSelected={selectedHours[rowIndex][colIndex]}
                  teams={reservedNames[rowIndex][colIndex]}
                  onClick={() => handleHourClick(rowIndex, colIndex)}
                />
              ))}
            </React.Fragment>
          ))} */}
        </div>
      </div>
    </div>
  );
}

export default Calendar
