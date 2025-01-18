import React, { useEffect, useState } from "react";
import { Member } from "../../types/type";
import { addFine } from "../../firebase/userService";
import Swal from "sweetalert2";

interface AddFineDataProps {
  members: Member[];
}

const AddFineData: React.FC<AddFineDataProps> = ({ members }) => {
  // 検索キーワードを管理
  const [searchTerm, setSearchTerm] = useState("");
  const [fine, setFine] = useState<{ lineId: string; fine: number }[]>([]);
  const [fineMembers, setFineMembers] = useState<Member[]>([]);
  const [changedMembers, setChangedMembers] = useState<
    { lineId: string; newFine: number }[]
  >([]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.trim());
  };
  useEffect(() => {
    setFineMembers(members);
  }, []);
  useEffect(() => {
    const fine = members.map((member) => {
      return { lineId: member.lineId, fine: member.fine };
    });
    setFine(fine);
  }, [members]);
  const filteredMembers = fineMembers.filter((member) =>
    member.name.includes(searchTerm)
  );
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    lineId: string
  ) => {
    const feeValue = e.target.value; // 入力値を取得
    const newFine = fine.map((fee) => {
      if (fee.lineId === lineId) {
        return { lineId: lineId, fine: feeValue ? Number(feeValue) : 0 }; // 数値に変換
      } else {
        return fee;
      }
    });
    setFine(newFine);
    // すでにlineIdが登録されていたら更新、されていなかったら追加
    setChangedMembers((prev) => {
      const newChangedMembers = [...prev];
      const index = newChangedMembers.findIndex(
        (member) => member.lineId === lineId
      );
      if (index === -1) {
        newChangedMembers.push({
          lineId: lineId,
          newFine: Number(feeValue),
        });
      } else {
        newChangedMembers[index].newFine = Number(feeValue);
      }
      return newChangedMembers;
    });
  };
  const handleSubmit = async () => {
    changedMembers.forEach((member) => {
      addFine(member.lineId, member.newFine);
    });
    setChangedMembers([]);
    Swal.fire({
      icon: "success",
      title: "罰金データを更新しました",
    });
  };
  return (
    <div>
      <h2 className="mb-2">罰金データを入力してください</h2>
      <input
        type="text"
        placeholder="名前(一部でも可)"
        className="border rounded p-1 mb-2 w-full"
        value={searchTerm}
        onChange={handleSearchChange} // 入力が変更されたときに呼び出す
      />
      <div className=" h-32 overflow-y-auto border rounded p-2">
        <ul className="">
          {filteredMembers.map((member) => (
            <li
              key={member.lineId}
              className="flex items-center border-b py-1 justify-between"
            >
              {member.name}
              <div>
                <input
                  type="text"
                  value={
                    fine.find((fee) => fee.lineId === member.lineId)
                      ?.fine === 0
                      ? "" // 0円の時は何も表示しない
                      : fine.find((fee) => fee.lineId === member.lineId)
                          ?.fine || ""
                  }
                  placeholder={
                    fine.find((fee) => fee.lineId === member.lineId)
                      ?.fine === 0
                      ? "0" // 0円の時にプレースホルダーを表示
                      : ""
                  }
                  onChange={(e) => handleChange(e, member.lineId)}
                  className="mr-2 text-right w-24"
                />
                <span>円</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 flex justify-end mt-4">
        <button
          className="bg-blue-500 text-white rounded p-1"
          onClick={handleSubmit}
        >
          決定
        </button>
      </div>
    </div>
  );
};

export default AddFineData;
