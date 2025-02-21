import { Reservation } from "../types/type";

const today = new Date();
const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1; // 月曜日を0とする

//今週の日付の配列
export const weekDays = Array.from({ length: 8 }, (_, index) => {
  const date = new Date(today);
  // 今日の日付-今日の月曜日からの日数 = 今週の月曜日
  // 今週の月曜日　+ index + 1 = 今週の日付の配列
  date.setDate(today.getDate() - currentDay + index);
  // 月/日の形式で返す(割り算ではない)
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
});

//dayの配列
export const daysOfWeek = ["月", "火", "水", "木", "金", "土", "日", "月"];
//timeの配列
export const timeSlots = [
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
export const slots = [
  "9:00~10:00",
  "10:00~11:00",
  "11:00~12:00",
  "12:00~13:00",
  "13:00~14:00",
  "14:00~15:00",
  "15:00~16:00",
  "16:00~17:00",
  "17:00~18:00",
  "18:00~19:00",
  "19:00~20:00",
  "20:00~21:30",
];

export const timeSlotsKinjyou = [
  "9:10",
  "10:55",
  "12:25",
  "13:20",
  "15:05",
  "16:45",
  "18:30",
];

export const slotsKinjyou = [
  "1コマ",
  "2コマ",
  "昼",
  "3コマ",
  "4コマ",
  "5コマ",
  "夜",
];

export function getDayIndex(date: Date): number {
  for (let i = 0; i < weekDays.length; i++) {
    if (
      weekDays[i].day === date.getDate() &&
      weekDays[i].month === date.getMonth() + 1 &&
      weekDays[i].year === date.getFullYear()
    ) {
      const dayIndex = i;
      return dayIndex;
    }
  }
  return -1;
}

export function getTimeIndex(date: Date): number {
  for (let i = 0; i < timeSlots.length; i++) {
    const hour = parseInt(timeSlots[i].split(":")[0], 10); // 文字列を数値に変換
    if (hour === date.getHours()) {
      const timeIndex = i;
      return timeIndex;
    }
  }
  return -1;
}
export function getTimeIndexKinjyou(date: Date): number {
  for (let i = 0; i < timeSlotsKinjyou.length; i++) {
    const hour = parseInt(timeSlotsKinjyou[i].split(":")[0], 10); // 文字列を数値に変換
    if (hour === date.getHours()) {
      const timeIndex = i;
      return timeIndex;
    }
  }
  return -1;
}

export function isReservationExist(
  reservations: Reservation[],
  hours: boolean[][]
): boolean {
  for (let i = 0; i < hours.length; i++) {
    for (let j = 0; j < hours[i].length; j++) {
      if (hours[i][j]) {
        for (let k = 0; k < reservations.length; k++) {
          if (
            reservations[k].dayIndex === i &&
            reservations[k].timeIndex === j
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export function isDuplicate(reservations: Reservation[]) {
  const updatedIsDuplicates = Array.from({ length: 8 }, () =>
    Array(12).fill(false)
  );
  const reservationCounts = Array.from({ length: 8 }, () => Array(12).fill(0));
  reservations.forEach((reservation) => {
    reservationCounts[reservation.dayIndex][reservation.timeIndex] += 1;
  });
  reservations.forEach((reservation) => {
    if (reservationCounts[reservation.dayIndex][reservation.timeIndex] > 1) {
      updatedIsDuplicates[reservation.dayIndex][reservation.timeIndex] = true;
    }
  });
  return updatedIsDuplicates;
}
