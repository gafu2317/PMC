// 加工済みのデータの型
export interface Reservation {
  id: string;//ドキュメントIDを使用
  names : string[];//使用者の名前
  date: Date;//時間まで含める (複数時間予約していても、別々の予約として扱う)
  dayIndex: number;//日にちのインデックス
  timeIndex: number;//時間のインデックス
  teamIndex: number;//チームのインデックス(同じ時間帯に複数の予約がある場合)
}
