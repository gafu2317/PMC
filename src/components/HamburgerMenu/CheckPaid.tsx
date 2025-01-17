import React,{useState} from "react";
import { Member } from "../../types/type";

interface CheckPaidProps {
  members: Member[];
}

const CheckPaid: React.FC<CheckPaidProps> = ({ members }) => {
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
  return (
    <div>
      
      {/* <h2 className="mb-2">支払い済みのメンバーを選択してください</h2>
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
      </div> */}
    </div>
  );
};

export default CheckPaid;
