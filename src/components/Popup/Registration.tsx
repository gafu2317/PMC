import React, { useState } from "react";
import { addUser } from "../../firebase/userService";
import { Member } from "../../types/type";
import Swal from "sweetalert2";

interface RegistrationPopupProps {
  lineId: string;
  members: Member[];
  onClose: () => void;
}

const RegistrationPopup: React.FC<RegistrationPopupProps> = ({
  lineId,
  members,
  onClose,
}) => {
  const [name, setName] = useState<string | null>(null); // 名前
  const [studentId, setStudentId] = useState<string | null>(null); // 学籍番号
  const [isConfirmationVisible, setIsConfirmationVisible] =
    useState<boolean>(false); // 確認ポップアップの表示状態

  const handleSubmit = () => {
    setIsConfirmationVisible(false);
    // 名前と学籍番号が入力されているかチェック
    if (!name || !studentId) {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "名前と学籍番号を入力してください。",
        confirmButtonText: "OK",
      });
      return;
    }

    // 既存のmembersの中に同じ名前があるかチェック
    const existingMember = members.find(
      (member) => member.name.trim() === name.trim()
    );
    // 既存のメンバーがいる場合
    if (existingMember) {
      // 名前の後に (学籍番号) を追加
      Swal.fire({
        icon: "warning",
        title: "注意",
        text: `既に同じ名前が登録されているので。${name} (${studentId}) で登録します。`,
        confirmButtonText: "OK",
      });
      const newName = `${name} (${studentId})`;
      addUser(lineId, newName, studentId);
    } else {
      // 名前が重複していない場合
      addUser(name, lineId, studentId);
    }
    onClose();
  };

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
        <div className="bg-white p-4 rounded shadow w-80">
          <h2 className="text-lg font-bold text-center">登録画面</h2>

          {/* 名前の入力フィールド */}
          <div className="mt-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              名前(本名を入力)
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="名前を入力"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 学籍番号の入力フィールド */}
          <div className="mt-4">
            <label
              htmlFor="studentId"
              className="block text-sm font-medium text-gray-700"
            >
              学籍番号
            </label>
            <input
              type="text"
              id="studentId"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="学籍番号を入力"
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>

          <div className="text-right mt-2">
            <button
              className="p-2 bg-gradient-to-b from-sky-600 to-blue-700 text-white rounded-full w-20"
              onClick={() => setIsConfirmationVisible(true)}
            >
              登録する
            </button>
          </div>
          {/* 確認画面 */}
          {isConfirmationVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
              <div className="bg-white p-4 rounded shadow w-80">
                <h2 className="text-lg font-bold text-center">確認</h2>
                <p>以下の内容でよろしいですか？</p>
                <p>名前: {name}</p>
                <p>学籍番号: {studentId}</p>
                <p className="text-xs mt-2">
                  ※同姓同名がいた場合、名前の後ろに学籍番号が付きます
                </p>
                <div className="flex justify-between mt-4">
                  <button
                    className=" p-2 bg-gradient-to-b from-red-400 to-red-700  text-white rounded-full"
                    onClick={() => setIsConfirmationVisible(false)}
                  >
                    キャンセル
                  </button>
                  <button
                    className=" p-2 bg-gradient-to-b from-green-400 to-green-700  text-white rounded-full"
                    onClick={handleSubmit}
                  >
                    確認しました
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationPopup;
