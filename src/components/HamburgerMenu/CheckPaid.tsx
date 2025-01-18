import React, { useEffect, useState } from "react";
import { Member } from "../../types/type";
import { getUnpaidFee } from "../../firebase/userService";

interface CheckPaidProps {
  members: Member[];
}

const CheckPaid: React.FC<CheckPaidProps> = ({ members }) => {
  // 検索キーワードを管理
  const [searchTerm, setSearchTerm] = useState("");
  const [unPaidFee, setUnPaidFee] = useState<{lineId:string;unPaidFee:number}[]>([]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.trim());
  };
  const filteredMembers = members.filter((member) =>
    member.name.includes(searchTerm)
  );
  useEffect(() => {
    const unPaidFee = members.map((member) => {
      return {lineId:member.lineId,unPaidFee:0}//未払金を0円に初期化
    })
    setUnPaidFee(unPaidFee)
  } ,[])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>,lineId:string) => {
    const newUnPaidFee = unPaidFee.map((fee) => {
      if(fee.lineId === lineId){
        return {lineId:lineId,unPaidFee:Number(e)}
      }else{
        return fee
      }
    })
    setUnPaidFee(newUnPaidFee)
  };

  return (
    <div>
      <h2 className="mb-2">支払った人のは未払金を０円にしてください</h2>
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
              {member.name}
              <input
                type="text"
                id="unPaidFee"
                value={unPaidFee.find((fee) => fee.lineId === member.lineId)?.unPaidFee}
                onChange={(e) => handleChange(e,member.lineId)}
                className="mr-2 text-right"
              />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <button>決定</button>
      </div>
    </div>
  );
};

export default CheckPaid;
