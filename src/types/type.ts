// 加工済みのデータの型
export interface Reservation {
  id: string; //ドキュメントIDを使用
  names: string[]; //使用者の名前
  date: Date; //時間まで含める (複数時間予約していても、別々の予約として扱う)17:00~18:00は17:00とする
  dayIndex: number; //日にちのインデックス
  timeIndex: number; //時間のインデックス
}

export interface Member {
  lineId: string;
  name: string;
  studentId: number;
  fine: number;
  unPaidFee: number;
}

export interface Band {
  bandId: string;
  name: string;
  memberIds: string[];
}
