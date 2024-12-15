// Popup.tsx
import React from "react";

interface PopupProps {
  message: string; // メッセージ
  onClose: () => void; // 閉じるハンドラ
}

const Popup: React.FC<PopupProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-lg font-bold">{message}</h2>
        <button
          className="mt-4 p-2 bg-blue-500 text-white rounded"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default Popup;
