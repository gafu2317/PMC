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
 * URLをクリップボードにコピーする関数
 * @param url コピーするURL
 */
const copyToClipboard = async (url: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(url);
    Swal.fire({
      icon: 'success',
      title: 'コピー完了',
      text: 'URLをコピーしました！ブラウザのアドレスバーに貼り付けてください。',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('コピーに失敗:', error);
    Swal.fire({
      icon: 'error',
      title: 'コピー失敗',
      text: 'URLのコピーに失敗しました。手動でコピーしてください。',
      timer: 2000,
      showConfirmButton: false
    });
  }
};

/**
 * LIFFで外部ブラウザを開く関数
 * @param url 開くURL
 */
const openInExternalBrowser = (url: string): void => {
  try {
    if ((window as any).liff && (window as any).liff.openWindow) {
      (window as any).liff.openWindow({
        url: url,
        external: true
      });
    } else {
      // LIFFが利用できない場合は通常のwindow.open
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error('外部ブラウザで開くのに失敗:', error);
    // エラーの場合はURLをコピー
    copyToClipboard(url);
  }
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
      <p>以下から選択してください：</p>
      <br>
      <div style="margin: 15px 0;">
        <p style="margin: 5px 0; font-weight: bold;">名工大版:</p>
        <div style="display: flex; gap: 10px;">
          <button id="open-meikou" 
                  style="flex: 1; padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            ブラウザで開く
          </button>
          <button id="copy-meikou" 
                  style="flex: 1; padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            URLをコピー
          </button>
        </div>
      </div>
      <div style="margin: 15px 0;">
        <p style="margin: 5px 0; font-weight: bold;">金城版:</p>
        <div style="display: flex; gap: 10px;">
          <button id="open-kinjyou" 
                  style="flex: 1; padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            ブラウザで開く
          </button>
          <button id="copy-kinjyou" 
                  style="flex: 1; padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            URLをコピー
          </button>
        </div>
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
    },
    didOpen: () => {
      // ボタンのイベントリスナーを設定
      document.getElementById('open-meikou')?.addEventListener('click', () => {
        openInExternalBrowser('https://pmc-lilac.vercel.app/Meikou');
      });
      document.getElementById('copy-meikou')?.addEventListener('click', () => {
        copyToClipboard('https://pmc-lilac.vercel.app/Meikou');
      });
      document.getElementById('open-kinjyou')?.addEventListener('click', () => {
        openInExternalBrowser('https://pmc-lilac.vercel.app/Kinjyou');
      });
      document.getElementById('copy-kinjyou')?.addEventListener('click', () => {
        copyToClipboard('https://pmc-lilac.vercel.app/Kinjyou');
      });
    }
  });
};

/**
 * 料金確定前のExcelダウンロード確認ダイアログ
 * @returns 確認結果のPromise
 */
export const showPriceConfirmWithExcelCheck = (): Promise<any> => {
  return Swal.fire({
    icon: "info",
    title: "料金確定の実行",
    text: "Excelファイルが必要な場合は、先にExcelファイルをダウンロードしてください。",
    showCancelButton: true,
    confirmButtonText: "OK（料金確定を実行）",
    cancelButtonText: "キャンセル"
  });
};
