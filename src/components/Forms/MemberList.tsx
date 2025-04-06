import React from "react";
import { useState } from "react";
import { Member } from "../../types/type";

interface MemberListProps {
  members: Member[]; // 部員の名前
  selectedMembers: Member[]; // 選択されたメンバー
  handleAddSelectedMembers: (member: Member) => void; // メンバーを追加するハンドラ
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  selectedMembers,
  handleAddSelectedMembers,
}) => {
  // 入力されたフィルター文字列を管理
  const [filterText, setFilterText] = useState<string>("");
  // フィルタリングされたメンバーを取得
  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div>
      {/* 名前を検索する要素 */}
      <input
        type="text"
        placeholder="検索"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="border border-blue-200 rounded p-1 mb-1 w-full"
      />
      {/* 縦スクロース可能なメンバー選択要素 */}
      <div className="border border-blue-200 rounded h-32 overflow-y-auto">
        <ul className="list-disc pl-5">
          {filteredMembers.map((member) => (
            <li
              key={member.lineId}
              className={`py-1 flex items-center rounded-full`}
            >
              <label
                htmlFor={member.lineId}
                className="user-select-none cursor-pointer flex items-center w-full"
                onClick={() => handleAddSelectedMembers(member)}
              >
                <input
                  type="checkbox"
                  id={member.lineId}
                  checked={selectedMembers.includes(member)}
                  onChange={() => handleAddSelectedMembers(member)}
                  className="mr-2 appearance-none h-3 w-3 border border-blue-200 rounded-full checked:bg-blue-500 checked:border-transparent focus:outline-none"
                />
                <span className="flex-grow">{member.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      {/* 選択されたメンバーを表示する横スクロール可能な要素 */}
      <div className="overflow-x-auto mt-1 px-1 h-16 border border-blue-200 rounded">
        <span className="text-xs ml-1">選択されたメンバー</span>
        <div className="flex space-x-1">
          {selectedMembers.map((member) => (
            <div key={member.lineId} className="whitespace-nowrap">
              <span className="bg-gray-200 rounded-full px-2 py-1 text-sm">
                {member.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberList;
