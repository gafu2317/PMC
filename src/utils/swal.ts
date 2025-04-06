import Swal from "sweetalert2";

/**
 * エラーメッセージを表示する
 * @param message エラーメッセージ
 * @param title タイトル（デフォルト: 'エラー'）
 */
export const showError = (
  message: string,
  title: string = "エラー"
): Promise<any> => {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonText: "OK",
  });
};

/**
 * 警告メッセージを表示する
 * @param message 警告メッセージ
 * @param title タイトル（デフォルト: '警告'）
 */
export const showWarning = (
  message: string,
  title: string = "警告"
): Promise<any> => {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonText: "OK",
  });
};

/**
 * 成功メッセージを表示する
 * @param message 成功メッセージ
 * @param title タイトル（デフォルト: '成功'）
 */
export const showSuccess = (
  message: string,
  title: string = "成功"
): Promise<any> => {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonText: "OK",
  });
};

/**
 * 確認ダイアログを表示する
 * @param message 確認メッセージ
 * @param title タイトル（デフォルト: '確認'）
 * @returns 確認結果のPromise
 */
export const showConfirm = (
  message: string,
  title: string = "確認"
): Promise<any> => {
  return Swal.fire({
    icon: "question",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: "はい",
    cancelButtonText: "いいえ",
  });
};
