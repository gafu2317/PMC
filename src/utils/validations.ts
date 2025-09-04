import { CreateUserRequest, CreateBandRequest, UpdateBandRequest } from "../types/type";

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

// Validation functions
export const validateBandName = (name: string): boolean => {
  // バンド名は空文字を許可しない（表示に使用するため）
  return typeof name === 'string' && name.trim().length > 0;
};

export const validateMemberIds = (memberIds: string[]): boolean => {
  // メンバーIDは配列で、最低1人は必要
  return Array.isArray(memberIds) && 
         memberIds.length > 0 && 
         memberIds.every(id => typeof id === 'string' && id.trim().length > 0);
};

export const validateBandId = (bandId: string): boolean => {
  // バンドIDは空文字を許可しない
  return typeof bandId === 'string' && bandId.trim().length > 0;
};


export const validateCreateBandRequest = (request: CreateBandRequest): string | null => {
  if (!validateBandName(request.name)) {
    return "Invalid band name: must be a non-empty string";
  }
  if (!validateMemberIds(request.memberIds)) {
    return "Invalid member IDs: must be a non-empty array of valid user IDs";
  }
  // 重複メンバーチェック
  const uniqueIds = new Set(request.memberIds);
  if (uniqueIds.size !== request.memberIds.length) {
    return "Duplicate member IDs are not allowed";
  }
  return null;
};

export const validateUpdateBandRequest = (request: UpdateBandRequest): string | null => {
  // 更新時は少なくとも1つのフィールドが必要
  if (!request.name && !request.memberIds) {
    return "At least one field (name or memberIds) must be provided for update";
  }
  if (request.name && !validateBandName(request.name)) {
    return "Invalid band name: must be a non-empty string";
  }
  if (request.memberIds && !validateMemberIds(request.memberIds)) {
    return "Invalid member IDs: must be a non-empty array of valid user IDs";
  }
  // 重複メンバーチェック
  if (request.memberIds) {
    const uniqueIds = new Set(request.memberIds);
    if (uniqueIds.size !== request.memberIds.length) {
      return "Duplicate member IDs are not allowed";
    }
  }
  return null;
};