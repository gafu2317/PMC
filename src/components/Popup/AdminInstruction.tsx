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
        className="bg-white  px-6 pb-6 pt-3 rounded shadow-md w-4/5"
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
        <h2>優先権ついて</h2>
        <h2>支払い確認ついて</h2>
        <h2>料金計算ついて</h2>
        <h2>ライブ日の設定ついて</h2>
        <h2>罰金データの追加ついて</h2>
        <h2>パスワード変更ついて</h2>
        <h2>部員データの削除ついて</h2>
        <h2>予約データの削除ついて</h2>
        <h2>バンドデータの削除ついて</h2>
      </div>
    </div>
  );
};

export default AdminInstruction;
