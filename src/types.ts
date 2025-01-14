// src/types.ts
export interface UserData {
  id?: string; // FirestoreのドキュメントID
  name: string; // 名前
  lineId: string; // LINE ID
  fee: number; // 料金
}
