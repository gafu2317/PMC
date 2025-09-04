import { CreateUserRequest } from "../types/type";

// Validation functions - 不正データによるデータベース破損を防ぐ
export const validateLineId = (lineId: string): boolean => {
  // LINE IDは空文字を許可しない（LINEとの連携が必須のため）
  return typeof lineId === 'string' && lineId.trim().length > 0;
};

export const validateName = (name: string): boolean => {
  // 名前は表示に使用するため空文字は許可しない
  return typeof name === 'string' && name.trim().length > 0;
};

export const validateStudentId = (studentId: number): boolean => {
  // 学生IDは正の整数のみ有効（学籍番号の形式として）
  return typeof studentId === 'number' && Number.isInteger(studentId) && studentId > 0;
};

export const validateCreateUserRequest = (request: CreateUserRequest): string | null => {
  // すべての必須フィールドを事前検証して、データベースアクセス前にエラーを検出
  if (!validateLineId(request.lineId)) {
    return "Invalid LINE ID: must be a non-empty string";
  }
  if (!validateName(request.name)) {
    return "Invalid name: must be a non-empty string";
  }
  if (!validateStudentId(request.studentId)) {
    return "Invalid student ID: must be a positive integer";
  }
  return null; // null = バリデーション成功
};