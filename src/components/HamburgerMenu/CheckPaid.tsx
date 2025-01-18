import React, { useEffect, useState } from "react";
import { Member } from "../../types/type";
import { addUnpaidFee } from "../../firebase/userService";
import Swal from "sweetalert2";

interface CheckPaidProps {
  members: Member[];
}

const CheckPaid: React.FC<CheckPaidProps> = ({ members }) => {
  // 検索キーワードを管理
  const [searchTerm, setSearchTerm] = useState("");
  const [unPaidFee, setUnPaidFee] = useState<
    { lineId: string; unPaidFee: number }[]
  >([]);
  const [isAll, setIsAll] = useState(false); //全員表示されているかどうか
  const [unPaidMembers, setUnPaidMembers] = useState<Member[]>([]);
  const [changedMembers, setChangedMembers] = useState<
    { lineId: string; newUnPaidFee: number }[]
  >([]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.trim());
  };
  useEffect(() => {
    setUnPaidMembers(members.filter((member) => member.unPaidFee > 0));
  }, []);
  useEffect(() => {
    const unPaidFee = members.map((member) => {
      return { lineId: member.lineId, unPaidFee: member.unPaidFee };
    });
    setUnPaidFee(unPaidFee);
  }, [members]);
  const filteredMembers = unPaidMembers.filter((member) =>
    member.name.includes(searchTerm)
  );
  const handleChangeIsAll = () => {
    if (isAll) {
      setUnPaidMembers(members.filter((member) => member.unPaidFee > 0));
    } else {
      setUnPaidMembers(members);
    }
    setIsAll(!isAll);
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    lineId: string
  ) => {
    const feeValue = e.target.value; // 入力値を取得
    const newUnPaidFee = unPaidFee.map((fee) => {
      if (fee.lineId === lineId) {
        return { lineId: lineId, unPaidFee: feeValue ? Number(feeValue) : 0 }; // 数値に変換
      } else {
        return fee;
      }
    });
    setUnPaidFee(newUnPaidFee);
    // すでにlineIdが登録されていたら更新、されていなかったら追加
    setChangedMembers((prev) => {
      const newChangedMembers = [...prev];
      const index = newChangedMembers.findIndex(
        (member) => member.lineId === lineId
      );
      if (index === -1) {
        newChangedMembers.push({
          lineId: lineId,
          newUnPaidFee: Number(feeValue),
        });
      } else {
        newChangedMembers[index].newUnPaidFee = Number(feeValue);
      }
      return newChangedMembers;
    });
  };

  const handleSubmit = async () => {
    changedMembers.forEach((member) => {
      addUnpaidFee(member.lineId, member.newUnPaidFee);
    });
    setChangedMembers([]);
    Swal.fire({
      icon: "success",
      title: "未払金を更新しました",
    });
  };

  return (
    <div>
      <h2 className="mb-2">未払金を更新してください</h2>
      <div>
        <button
          className="bg-gray-300 rounded mb-2 w-48"
          onClick={handleChangeIsAll}
        >
          {isAll ? "未払いのメンバーを表示" : "全メンバーを表示"}{" "}
        </button>
      </div>
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
                    unPaidFee.find((fee) => fee.lineId === member.lineId)
                      ?.unPaidFee === 0
                      ? "" // 0円の時は何も表示しない
                      : unPaidFee.find((fee) => fee.lineId === member.lineId)
                          ?.unPaidFee || ""
                  }
                  placeholder={
                    unPaidFee.find((fee) => fee.lineId === member.lineId)
                      ?.unPaidFee === 0
                      ? "0" // 0円の時にプレースホルダーを表示
                      : ""
                  }
                  onChange={(e) => handleChange(e, member.lineId)}
                  className="mr-2 text-right w-24"
                />
                円
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

export default CheckPaid;
