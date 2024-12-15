// Popup.tsx
import React from "react";

interface PopupProps {
  onSubmit: (name: string) => void; // 送信ハンドラ
  onClose: () => void; // 閉じるハンドラ
}

const Popup: React.FC<PopupProps> = ({ onSubmit, onClose }) => {
  const [name, setName] = React.useState(""); // 名前の入力値を管理

  const handleSubmit = () => {
    if (name) {
      onSubmit(name); // 親コンポーネントに名前を送信
      onClose(); // ポップアップを閉じる
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-lg font-bold">
          予約する人の名前を入力してください
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 mt-2 w-full"
          placeholder="名前を入力"
        />
        <div className="flex justify-between mt-4">
          <button
            className="p-2 bg-blue-500 text-white rounded"
            onClick={handleSubmit}
          >
            決定
          </button>
          <button
            className="p-2 bg-gray-300 text-black rounded"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
