// 加工済みのデータの型
export type StudioLocation = 'meiko' | 'kinjyou';

export interface Reservation {
  id: string;
  names: string[];
  date: Date;
  location: StudioLocation;
  dayIndex?: number;
  timeIndex?: number;
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

// バンドの型
export interface Band {
  bandId: string;
  name: string;
  memberIds: string[];
}

// プリセットの型
export interface Preset {
  presetId: string;
  name?: string;
  membersLineIds: string[];
}

// 予約禁止期間の型
export interface BanPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  location: StudioLocation;
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

// プリセット作成リクエスト
export interface CreatePresetRequest {
  lineId: string;
  membersLineIds: string[];
  name?: string;
}

export interface CreateReservationRequest {
  names: string[];
  date: Date;
  location: StudioLocation;
}

