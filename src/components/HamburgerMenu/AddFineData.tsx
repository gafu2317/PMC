import React, { useState } from "react";
import { Member } from "../../types/type";
import { addFine } from "../../firebase/userService";

interface AddFineDataProps {
  members: Member[];
}

const AddFineData: React.FC<AddFineDataProps> = ({ members }) => {
  // 検索キーワードを管理
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.trim());
  };
  const filteredMembers = members.filter((member) =>
    member.name.includes(searchTerm)
  );
  // 選択されたメンバーのLineIdを管理
  const [selectedMembers, setSelectedMembers] = useState<string>("");
  const toggleSelectMember = (lineId: string) => {
    if (selectedMembers === lineId) {
      setSelectedMembers("");
    } else {
      setSelectedMembers(lineId);
    }
  };
  const [fineAmount, setFineAmount] = useState<number | null>(null);
  const handleFineAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFineAmount(Number(e.target.value));
  };

  const handleSubmit = () => {
    if (selectedMembers && fineAmount) {
      addFine(selectedMembers, fineAmount);
      setSelectedMembers("");
      setFineAmount(null);
    }
  };
  return (
    <div>
      <h2 className="mb-2">メンバーを選択してください</h2>
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
            <li key={member.lineId} className="flex items-center border-b py-1">
              <input
                type="checkbox"
                checked={selectedMembers === member.lineId}
                onChange={() => toggleSelectMember(member.lineId)}
                className="mr-2"
              />
              {member.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2">
        <label className="block mb-1 ">罰金額</label>
        <input
          type="number"
          className="border rounded p-1 w-full"
          placeholder="罰金額を入力してください"
          value={fineAmount?.toString() || ""}
          onChange={handleFineAmountChange}
        />
      </div>
      <div className="mt-2 flex justify-end mt-4">
        <button
          className="bg-red-500 text-white rounded p-1"
          onClick={handleSubmit}
        >
          決定
        </button>
      </div>
    </div>
  );
};

export default AddFineData;
