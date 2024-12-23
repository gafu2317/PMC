import React from "react";
import { useState } from "react";

interface ReservationPopupProps {
  daysOfWeek: string[];
  timeSlots: string[];
  reservedNames: string[][][][];
  selectedReservations: {
    dayIndex: number;
    timeIndex: number;
    teamIndex: number;
  }[];
  onClose: () => void;
  onNameAdd: (
    dayIndex: number,
    timeIndex: number,
    teamIndex: number,
    namesToAdd: string[]
  ) => void;
  onNameRemove: (
    dayIndex: number,
    timeIndex: number,
    teamIndex: number,
    namesToRemove: string[]
  ) => void;
  onDelete: (
    dayIndex: number, 
    timeIndex: number, 
    teamIndex: number,
  ) => void;
}

const EditReservationPopup: React.FC<ReservationPopupProps> = ({
  daysOfWeek,
  timeSlots,
  reservedNames,
  selectedReservations,
  onClose,
  onNameAdd,
  onNameRemove,
  onDelete,
}) => {
  // 名前の入力値を管理
  const [names, setNames] = useState<string[]>([""]);

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

  // 追加ボタンがクリックされたときのハンドラ
  const handleAdd = () => {
    selectedReservations.forEach((reservation) => {
      const { dayIndex, timeIndex, teamIndex } = reservation;
      console.log("reservation", reservation);
      onNameAdd(dayIndex, timeIndex, teamIndex, names);
    });
  };

  // 削除ボタンがクリックされたときのハンドラ
  const handleRemove = () => {
    selectedReservations.forEach((reservation) => {
      const { dayIndex, timeIndex, teamIndex } = reservation;
      onNameRemove(dayIndex, timeIndex, teamIndex, names);
    });
  };

  //　予約自体を削除するハンドラ
  const handleDelete = () => {
    onClose();
    selectedReservations.forEach((reservation) => {
      const { dayIndex, timeIndex, teamIndex } = reservation;
      onDelete(dayIndex, timeIndex, teamIndex);
    });
  };

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-lg font-bold mb-3 w-80 flex justify-center">
            {" "}
            予約を編集してください{" "}
          </h2>
          <div className="border border-gray-400 rounded">
            {selectedReservations.map((reservation, index) => {
              const { dayIndex, timeIndex, teamIndex } = reservation;
              const teams = reservedNames[timeIndex][dayIndex][teamIndex]; // チームメンバーを取得
              return (
                <div key={index} className="mb-2 p-2">
                  <h3>
                    {daysOfWeek[dayIndex]}曜日 {timeSlots[timeIndex]}
                  </h3>
                  <div> {teams.join(", ")}</div>
                </div>
              );
            })}
          </div>
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
            className="mt-2 p-2 mr-2 bg-gradient-to-b from-sky-400 to-blue-500 text-white rounded-full w-10"
            onClick={handleSubInput}
          >
            -
          </button>
          <button
            className="mt-2 mr-2 p-2 bg-gradient-to-b from-green-400 to-green-500 text-white rounded-full"
            onClick={handleAdd}
          >
            追加
          </button>
          <button
            className="mt-2 mr-2 p-2 bg-gradient-to-b from-red-400 to-red-500 text-white rounded-full"
            onClick={handleRemove}
          >
            削除
          </button>
          <div className="mt-4 flex justify-between">
            <div className="flex">
              <button
                className="mt-2 p-2 bg-gradient-to-b from-red-600 to-red-700 text-white rounded-full"
                onClick={handleDelete}
              >
                予約自体を削除
              </button>
            </div>
            <div className="flex items-center">
              <button
                className="p-2 text-black rounded-full w-20 bg-gradient-to-b from-gray-300 to-gray-400"
                onClick={onClose}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditReservationPopup;
