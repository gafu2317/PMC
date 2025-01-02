export interface Reservations {
  id: string;//ドキュメントIDを使用
  names : string[];//使用者の名前
  start: Date;//時間まで含める
  end: Date;//時間まで含める
}