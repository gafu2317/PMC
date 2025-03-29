import React from "react";

interface Props {
  onClose: () => void;
}

const AdminInstruction: React.FC<Props> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white  px-6 pb-6 pt-3 rounded shadow-md w-4/5 h-4/5 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h1 className="flex-grow text-center text-lg font-semibold items-center">
            使い方
          </h1>
          <button
            className="text-lg font-bold hover:text-gray-800 focus:outline-none"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mt-6">
          1. ライブ前
        </h2>
        <ul className="list-disc list-inside ml-5">
          <li>公式Lineから予約をしてもらう</li>
          <li>
            まだ名前等を登録していない人がいたら登録してもらうように部会などで言う
          </li>
          <li>バンドが決まり次第登録してもらうように言う</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-700 mt-6">
          2. ライブが終わったあと
        </h2>
        <ul className="list-disc list-inside ml-5">
          <li>バンドが全て登録されているかを確認</li>
          <li>罰金データを追加</li>
          <li>料金計算（料金がLineに通知され、料金が未払金に追加されます）</li>
          <li>
            Excel等にデータのコピー（料金計算をするとクリップボードにコピーされます）
          </li>
          <li>
            次のライブの日を設定する（これは料金計算のためのメモに過ぎない）
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-700 mt-6">
          3. 部会の時
        </h2>
        <ul className="list-disc list-inside ml-5">
          <li>優先権を有効にする</li>
          <li>料金回収</li>
          <li>回収したら管理者画面から未払金を0にする</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-700 mt-6">
          4. 年度が変わる時
        </h2>
        <ul className="list-disc list-inside ml-5">
          <li>まだ料金を計算していない予約がある場合は料金計算をする</li>
          <li>予約を全て削除する</li>
          <li>部員を全員削除する</li>
          <li>部員に登録してもらうように言う</li>
          <li>管理者画面のパスワードを変更する（必須ではない）</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-700 mt-6">
          5. 学スタライブ等で学スタ予約を禁止したい時
        </h2>
        <ul className="list-disc list-inside ml-5">
          <li>学スタを予約禁止にする期間を入力する</li>
          <li>もしその期間に予約があれば削除される(確認メッセージあり)</li>
          
        </ul>
        <h2 className="text-lg font-semibold text-gray-700 mt-6">
          6. トラブル発生時
        </h2>
        <ul className="list-disc list-inside ml-5">
          <li>
            名前、学籍番号を間違って登録した
            →部員削除から削除してもう一度登録してもらう
          </li>
          <li>バンドを間違って登録した →バンド削除から削除</li>
          <li>
            過去と当日の予約を削除する時
            →予約削除から削除し、削除した分の使用料を罰金として追加する
          </li>
        </ul>
        <h2 className="text-lg font-semibold text-gray-700 mt-6">
          7. 詳しい使い方は引き継ぎ資料を参照
        </h2>
      </div>
    </div>
  );
};

export default AdminInstruction;
