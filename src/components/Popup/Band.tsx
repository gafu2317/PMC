import React, { useState } from "react";
import { Band, Member } from "../../types/type";
import { addBand, addPresets, updateBand } from "../../firebase/userService";
import { MemberList } from "../Forms";
import {
  showError,
  showWarning,
  showSuccess,
  showConfirm,
} from "../../utils/swal";

interface BandPopupProps {
  myLineId: string;
  members: Member[];
  bands: Band[];
  onClose: () => void;
}

const BandPopup: React.FC<BandPopupProps> = ({
  myLineId,
  bands,
  onClose,
  members,
}) => {
  const getBandMembers = (memberIds: string[]) => {
    return members.filter((member) => memberIds.includes(member.lineId));
  };
  const [isAddPreset, setIsAddPreset] = useState<boolean>(true);
  //　バンド登録画面
  const [isBandAddPopupVisible, setIsBandAddPopupVisible] =
    useState<boolean>(false);
  //　バンド編集画面
  const [isBandEditPopupVisible, setIsBandEditPopupVisible] =
    useState<boolean>(false);

  const [bandName, setBandName] = useState<string | null>(null); // 追加するバンドにつける名前を管理
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]); // 選択されたメンバーをMembersの配列で管理
  const [selectedBand, setselectedBand] = useState<Band | undefined>(undefined); // 選択されたバンドをBand型で管理
  const onPopupClose = () => {
    setIsBandAddPopupVisible(false);
    setIsBandEditPopupVisible(false);
    setBandName(null);
    setSelectedMembers([]);
    setselectedBand(undefined);
  };
  const handleAddSelectedMembers = (member: Member) => {
    setSelectedMembers((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m.lineId !== member.lineId)
        : [...prev, member]
    );
  };
  const handleAddselectedBand = (band: Band) => {
    if (!band.memberIds.includes(myLineId)) {
      showWarning("自分が所属していないバンドは編集できません。");
      return;
    }
    if (selectedBand === band) {
      setselectedBand(undefined);
    } else {
      setselectedBand(band);
    }
  };
  // バンドにメンバーを追加する関数
  const addMembers = () => {
    const AdditionalMemberIds = selectedMembers.map((member) => member.lineId);
    if (selectedBand && selectedMembers.length > 0) {
      const newMemberIds = Array.from(
        new Set([...selectedBand.memberIds, ...AdditionalMemberIds])
      );
      updateBand(selectedBand.bandId, selectedBand.name, newMemberIds);
    } else {
      showError("必要な情報を選択してください。");
    }
  };
  // バンドからメンバーを削除する関数
  const deleteMembers = () => {
    const deleteMemberIds = selectedMembers.map((member) => member.lineId);
    if (selectedBand && selectedMembers.length > 0) {
      const newMemberIds = selectedBand.memberIds.filter(
        (memberId) => !deleteMemberIds.includes(memberId)
      );
      if (newMemberIds.length === 0) {
        showWarning("バンドには最低1人のメンバーが必要です。");
      } else {
        updateBand(selectedBand.bandId, selectedBand.name, newMemberIds);
      }
    } else {
      showError("必要な情報を選択してください。");
    }
  };
  const changeBandName = () => {
    if (selectedBand && bandName) {
      updateBand(selectedBand.bandId, bandName, selectedBand.memberIds);
    } else {
      showError("必要な情報を選択してください。");
    }
  };

  // バンドを追加する関数
  const handleAddBand = () => {
    const memberIds = selectedMembers.map((member) => member.lineId);
    if (bandName) {
      addBand(bandName, memberIds);
      if (isAddPreset) {
        addPresets(myLineId, memberIds);
      }
      setIsBandAddPopupVisible(false);
    } else {
      showError("バンド名を入力してください。");
    }
  };

  //バンドをクリックしたらプリセットに追加する関数
  const handleAddBandToPreset = (band: Band) => {
    //自分が所属しているバンドを選択した場合
    showConfirm(
      `${band.name}をプリセットに追加しますか？`,
      "プリセットに追加"
    ).then((result) => {
      if (result.isConfirmed) {
        if (band.memberIds.includes(myLineId)) {
          addPresets(myLineId, band.memberIds, band.name);
          showSuccess("プリセットに追加しました。");
        }
        //自分が所属していないバンドを選択した場合
        else {
          showWarning(
            "自分が所属していないバンドはプリセットに追加できません。"
          );
        }
      }
    });
  };
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white  px-6 pb-6 pt-3 rounded shadow-md w-4/5 max-h-[80vh] overflow-y-auto"
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
            <li
              key={band.bandId}
              className="border-b pb-2"
              onClick={() => handleAddBandToPreset(band)}
            >
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
        <div className="flex justify-around mt-4">
          <button
            className="p-2 bg-gray-500  text-white rounded-full  "
            onClick={() => setIsBandEditPopupVisible(true)}
          >
            バンド編集
          </button>
          <button
            className="p-2 text-white rounded-full   bg-gray-500"
            onClick={() => setIsBandAddPopupVisible(true)}
          >
            バンド追加
          </button>
        </div>
        {isBandAddPopupVisible && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 "
            onClick={onPopupClose}
          >
            <div
              className="bg-white  px-6 pb-6 pt-3 rounded shadow-md w-5/6 h-3/5 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-center flex-grow">
                  バンド名を入力してください
                </h3>
                <button
                  className="text-lg font-bold hover:text-gray-800 focus:outline-none"
                  onClick={onPopupClose}
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
                  className="p-2 bg-blue-500  text-white rounded-full  "
                  onClick={handleAddBand}
                >
                  バンド追加
                </button>
              </div>
            </div>
          </div>
        )}
        {isBandEditPopupVisible && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onPopupClose}
          >
            <div
              className="bg-white  px-6 pb-6 pt-3 rounded shadow-md w-5/6 h-5/7 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className=" font-bold text-center flex-grow">
                  編集するバンドを選択してください
                </h3>
                <button
                  className="text-lg font-bold hover:text-gray-800 focus:outline-none"
                  onClick={onPopupClose}
                >
                  &times;
                </button>
              </div>
              <div className="border border-blue-200 rounded h-32 overflow-y-auto">
                <ul className="list-disc pl-5">
                  {bands.map((band) => (
                    <li
                      key={band.bandId}
                      className={`py-1 flex items-center rounded-full`}
                    >
                      <label
                        htmlFor={band.bandId}
                        className="user-select-none cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          id={band.bandId}
                          checked={selectedBand === band}
                          onChange={() => handleAddselectedBand(band)}
                          className="mr-2 appearance-none h-3 w-3 border border-blue-200 rounded-full checked:bg-blue-500 checked:border-transparent focus:outline-none"
                        />
                        {band.name}
                        <div className="ml-4">
                          {getBandMembers(band.memberIds).map((member) => (
                            <span
                              key={member.lineId}
                              className="mr-2 text-gray-700"
                            >
                              {member.name}
                            </span>
                          ))}
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className=" font-bold text-center m-2">
                  新しいバンド名を入力してください
                </h3>

                <input
                  type="text"
                  className="mt-1 block w-full border border-blue-200 rounded p-2 mb-2"
                  placeholder="バンド名を入力"
                  onChange={(e) => setBandName(e.target.value)}
                />
                <div className="flex justify-end mt-4">
                  <button
                    className="p-2 bg-blue-500 text-white rounded-full mx-2"
                    onClick={changeBandName}
                  >
                    バンド名変更
                  </button>
                </div>
                <h3 className=" font-bold text-center m-2">
                  編集するメンバーを選択してください
                </h3>
                <MemberList
                  members={members}
                  selectedMembers={selectedMembers}
                  handleAddSelectedMembers={handleAddSelectedMembers}
                />
              </div>
              <div className="flex justify-around mt-4">
                <button
                  className="p-2 bg-red-500  text-white rounded-full  "
                  onClick={deleteMembers}
                >
                  メンバー削除
                </button>
                <button
                  className="p-2 bg-green-500  text-white rounded-full  "
                  onClick={addMembers}
                >
                  メンバー追加
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
