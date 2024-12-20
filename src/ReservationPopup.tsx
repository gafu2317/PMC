import React from "react";
import { useState } from "react";

interface ReservationPopupProps {
  onSubmit: (names: string[]) => void; // 送信ハンドラ
  onClose: () => void; // 閉じるハンドラ
}

const ReservationPopup: React.FC<ReservationPopupProps> = ({
  onSubmit,
  onClose,
}) => {
  const [names, setNames] = useState<string[]>([""]); // 名前の入力値を管理

  // 名前の入力フィールドの値を更新
  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value; // 指定したインデックスの値を更新
    setNames(newNames);
  };

  const handleSubmit = () => {
    if (names.every((name) => name)) {
      // すべての名前が入力されているか確認
      onSubmit(names); // 親コンポーネントに名前を送信
      onClose(); // ポップアップを閉じる
    }
  };

  // ボタンがクリックされたときのハンドラ
  const handleAddInput = () => {
    setNames([...names, ""]); // 新しい空の文字列を追加
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-lg font-bold">
          使用する人の名前を入力してください
        </h2>
        {names.map((name, index) => (
          <input
            key={index}
            type="text"
            value={name}
            onChange={(e) => handleNameChange(index, e.target.value)} // 入力値の更新
            className="border p-2 mt-2 block"
            placeholder="名前を入力"
          />
        ))}
        <button
          className="mt-2 p-2 bg-blue-500 text-white rounded"
          onClick={handleAddInput}
        >
          使用者を追加
        </button>
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

export default ReservationPopup;
