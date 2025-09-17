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

/**
 * Excelダウンロード用の確認ダイアログを表示する（URL付き）
 * @returns 確認結果のPromise
 */
export const showExcelDownloadConfirm = (): Promise<any> => {
  return Swal.fire({
    icon: "info",
    title: "Excelダウンロードについて",
    html: `
      <p>ChromeやSafariなどのブラウザでないとダウンロードできません。</p>
      <br>
      <p>以下のURLをタップして開いてください：</p>
      <br>
      <div style="text-align: left; margin: 10px 0;">
        <p style="margin: 5px 0;"><strong>名工大版:</strong></p>
        <a href="https://pmc-lilac.vercel.app/Meikou" 
           target="_blank" 
           style="color: #007bff; text-decoration: underline; word-break: break-all;">
          https://pmc-lilac.vercel.app/Meikou
        </a>
      </div>
      <div style="text-align: left; margin: 10px 0;">
        <p style="margin: 5px 0;"><strong>金城版:</strong></p>
        <a href="https://pmc-lilac.vercel.app/Kinjyou" 
           target="_blank" 
           style="color: #007bff; text-decoration: underline; word-break: break-all;">
          https://pmc-lilac.vercel.app/Kinjyou
        </a>
      </div>
      <br>
      <p>OKを押すと処理を続行します。</p>
    `,
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "キャンセル",
    width: '90%',
    customClass: {
      htmlContainer: 'text-left'
    }
  });
};
