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

  // +ボタンがクリックされたときのハンドラ
  const handleAddInput = () => {
    setNames([...names, ""]); // 新しい空の文字列を追加
  };
  // -ボタンがクリックされたときのハンドラ
  const handleSubInput = () => {
    if (names.length > 1) {
      setNames(names.slice(0, -1)); // 最後の要素を削除
    }
  };

const handleSubmit = () => {
  // 空でない名前だけをフィルタリング
  const filteredNames = names.filter((name) => name);

  // フィルタリングされた名前を親コンポーネントに送信
  onSubmit(filteredNames);
  onClose(); // ポップアップを閉じる
};


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-lg font-bold">
          使用する人の名前を入力してください
        </h2>
        {names.map((name, index) => (
          <input
            key={index}
            type="text"
            value={name}
            onChange={(e) => handleNameChange(index, e.target.value)} // 入力値の更新
            className="border p-2 mt-2 block rounded-lg"
            placeholder="名前を入力"
          />
        ))}
        <button
          className="mt-2 p-2 mr-2 bg-gradient-to-b from-sky-400 to-blue-500 text-white rounded-full w-10"
          onClick={handleAddInput}
        >
          +
        </button>
        <button
          className="mt-2 p-2 bg-gradient-to-b from-sky-400 to-blue-500 text-white rounded-full w-10"
          onClick={handleSubInput}
        >
          -
        </button>
        <div className="flex justify-between mt-4">
          <button
            className="p-2 bg-gradient-to-b from-sky-600 to-blue-700  text-white rounded-full w-20"
            onClick={handleSubmit}
          >
            決定
          </button>
          <button
            className="p-2 text-black rounded-full w-20 bg-gradient-to-b from-gray-300 to-gray-400"
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
