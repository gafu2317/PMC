import React, { useState } from "react";
import { Member } from "../../types/type";
import { deleteUser } from "../../firebase/userService";
import Swal from "sweetalert2";

interface DeleteMemberDataProps {
  members: Member[];
}

const DeleteMemberData: React.FC<DeleteMemberDataProps> = ({ members }) => {
  // 検索キーワードを管理
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.trim());
  };
const filteredMembers = members.filter(
  (member) =>
    member.name.includes(searchTerm) ||
    String(member.studentId).includes(String(searchTerm))
);

  // 選択されたメンバーのLineIdを管理
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const selectAllMember = () => {
    if (selectedMembers.size === filteredMembers.length) {
      // 全て選択されている場合は解除
      setSelectedMembers(new Set());
    } else {
      // 全て選択
      const allSelected = new Set(
        filteredMembers.map((member) => member.lineId)
      );
      setSelectedMembers(allSelected);
    }
  };
  const toggleSelectMember = (lineId: string) => {
    setSelectedMembers((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(lineId)) {
        newSelected.delete(lineId);
      } else {
        newSelected.add(lineId);
      }
      return newSelected;
    });
  };

  // ローディング状態を管理
  const [loading, setLoading] = useState(false);

  const handleDeleteMembers = async () => {
    for (const lineId of selectedMembers) {
      setLoading(true);
      await deleteUser(lineId);
      setLoading(false);
      setSelectedMembers(
        (prev) => new Set([...prev].filter((id) => id !== lineId))
      );
    }
    setSelectedMembers(new Set());
    Swal.fire({
      icon: "success",
      title: "部員削除完了",
    });
  };

  return (
    <div>
      <h2 className="mb-2">部員データの削除</h2>
      <input
        type="text"
        placeholder="名前か学籍番号(一部でも可)"
        className="border rounded p-1 mb-2 w-full"
        value={searchTerm}
        onChange={handleSearchChange} // 入力が変更されたときに呼び出す
      />
      <button
        className="bg-blue-500 text-white rounded p-1 "
        onClick={selectAllMember}
      >
        {selectedMembers.size === filteredMembers.length
          ? "すべて解除"
          : "すべて選択"}
      </button>
      <div className="h-32 overflow-y-auto border rounded p-2 mt-2">
        <ul>
          {filteredMembers.map((member) => (
            <li key={member.lineId} className="flex items-center border-b py-1">
              <input
                type="checkbox"
                checked={selectedMembers.has(member.lineId)}
                onChange={() => toggleSelectMember(member.lineId)}
                className="mr-2"
              />
              {member.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-end mt-4">
        {loading && <span>削除中...</span>}
        <button
          className="bg-red-500 text-white rounded p-1"
          onClick={handleDeleteMembers}
        >
          削除
        </button>
      </div>
    </div>
  );
};

export default DeleteMemberData;
