// 加工済みのデータの型
export interface Reservation {
  id: string; //ドキュメントIDを使用
  names: string[]; //使用者の名前
  date: Date; //時間まで含める (複数時間予約していても、別々の予約として扱う)17:00~18:00は17:00とする
  dayIndex: number; //日にちのインデックス
  timeIndex: number; //時間のインデックス
}

// メンバーの型
export interface User {
  lineId: string;
  name: string;
  studentId: number;
  fine: number;//罰金
  performanceFee: number;//出演費
  studyFee: number;//学スタ費用
  unPaidFee: number;//未払い料金
}

export interface Band {
  bandId: string;
  name: string;
  memberIds: string[];
}

// 一貫したレスポンス形式で、呼び出し元がエラーハンドリングしやすくする
export interface ServiceResponse<T> {
  success: boolean;  // 成功/失敗の明確な判定
  data?: T;         // 成功時のデータ
  error?: string;   // 失敗時のエラーメッセージ
}

// ユーザー作成時の必要最小限の情報のみ要求（料金は自動で0初期化）
export interface CreateUserRequest {
  name: string;      // 必須：表示に使用
  lineId: string;    // 必須：LINE連携の主キー
  studentId: number; // 必須：学生識別用
}

// ユーザー情報更新時のオプショナルな情報
export interface CreateBandRequest {
  name: string;
  memberIds: string[];
}

// バンド情報更新時のオプショナルな情報
export interface UpdateBandRequest {
  name?: string;
  memberIds?: string[];
}


