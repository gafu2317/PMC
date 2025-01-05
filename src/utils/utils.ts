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

export function getDayIndex(date: Date): number {
  for (let i = 0; i < weekDays.length; i++) {
    if (weekDays[i].day === date.getDate()) {
      const dayIndex = i;
      return dayIndex;
    }
  }
  console.log("dayIndex not found");
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
  console.log("timeIndex not found");
  return -1;
}
