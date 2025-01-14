import React, { useState } from "react";
import { Band, Member } from "../types/type";
import { addBand, addPresets } from "../firebase/userService";
import MemberList from "./MemberList ";
import Swal from "sweetalert2";

interface BandPopupProps {
  myLineId: string;
  members: Member[];
  bands: Band[];
  onClose: () => void;
}

const BandPopup: React.FC<BandPopupProps> = ({ myLineId,bands, onClose, members }) => {
  const getBandMembers = (memberIds: string[]) => {
    return members.filter((member) => memberIds.includes(member.lineId));
  };  const [isAddPreset, setIsAddPreset] = useState<boolean>(true);
  //　バンド登録画面
  const [isBandPopupVisible, setIsBandPopupVisible] = useState<boolean>(false);

  const [bandName, setBandName] = useState<string | null>(null); // バンド名
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]); // 選択されたメンバーをMembersの配列で管理
  const handleAddSelectedMembers = (member: Member) => {
    setSelectedMembers(
      (prev) =>
        prev.includes(member)
          ? prev.filter((m) => m.lineId !== member.lineId) // lineIdでフィルタリング
          : [...prev, member] // メンバーを追加
    );
  };


  const addBandMembers = () => {
    const memberIds = selectedMembers.map((member) => member.lineId);
    if(bandName){
      addBand(bandName, memberIds);
      if (isAddPreset) {
        addPresets(myLineId, memberIds);
      }
      setIsBandPopupVisible(false);
    } else {
      Swal.fire({
        icon: "warning",
        title: "エラー",
        text: "バンド名を入力してください。",
        confirmButtonText: "OK",
      });
    }
  };
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white  px-6 pb-6 pt-3 rounded shadow-md w-4/5 max-h-2/5 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-semibold text-center flex-grow">
            バンド一覧
          </h2>
          <button
            className="text-lg font-bold hover:text-gray-800 focus:outline-none"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <ul>
          {bands.map((band) => (
            <li key={band.bandId} className="border-b pb-2">
              <h3 className="text-lg font-semibold">{band.name}</h3>
              <div className="ml-4">
                {getBandMembers(band.memberIds).map((member) => (
                  <span key={member.lineId} className="mr-2 text-gray-700">
                    {member.name}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-end mt-4">
          <button
            className="p-2 text-white rounded-full w-30 bg-gray-500"
            onClick={() => setIsBandPopupVisible(true)}
          >
            バンド追加
          </button>
        </div>
        {isBandPopupVisible && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setIsBandPopupVisible(false)}
          >
            <div
              className="bg-white  px-6 pb-6 pt-3 rounded shadow-md w-5/6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-center flex-grow">
                  バンド名を入力してください
                </h3>
                <button
                  className="text-lg font-bold hover:text-gray-800 focus:outline-none"
                  onClick={onClose}
                >
                  &times;
                </button>
              </div>
              <input
                type="text"
                className="mt-1 block w-full border border-blue-200 rounded p-2 mb-2"
                placeholder="バンド名を入力"
                onChange={(e) => setBandName(e.target.value)}
              />
              <h3 className="text-lg font-bold text-center mb-2">
                バンドメンバーを追加してください
              </h3>
              <MemberList
                members={members}
                selectedMembers={selectedMembers}
                handleAddSelectedMembers={handleAddSelectedMembers}
              />
              <div>
                <input
                  type="checkbox"
                  id="preset"
                  name="preset"
                  checked={isAddPreset}
                  onChange={() => setIsAddPreset(!isAddPreset)}
                />
                <label htmlFor="preset" className="ml-1 text-sm">
                  今回のメンバーをプリセットに登録する
                </label>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="p-2 bg-blue-500  text-white rounded-full w-30"
                  onClick={addBandMembers}
                >
                  バンド追加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BandPopup;
