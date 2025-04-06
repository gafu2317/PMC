import React, { useEffect, useState } from "react";
import { Member } from "../../types/type";
import {
  getPresets,
  deletePresets,
  addPresets,
} from "../../firebase/userService";
import Swal from "sweetalert2";
import { MemberList } from "../Forms"; // MemberListをインポート
import { showWarning, showError, showSuccess } from "../../utils/swal";

// インターフェースの定義
interface PresetPopupProps {
  myLineId: string; // lineId
  members: Member[]; // メンバーの情報
  onClose: () => void; // ポップアップを閉じるための関数
  setSelectedMembers: (members: Member[]) => void; // メンバーを選択するための関数
}

const PresetPopup: React.FC<PresetPopupProps> = ({
  myLineId,
  members,
  onClose,
  setSelectedMembers,
}) => {
  const [presets, setPresets] = useState<
    | {
        name?: string;
        membersLineId: string[];
        membersName: string[];
        presetId: string;
      }[]
    | undefined
  >(undefined); // presetsの状態
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // 選択されたプリセットの番号を管理
  const [isAddPresetVisible, setIsAddPresetVisible] = useState(false); // 追加プリセットのpopupの表示状態を管理
  const [newPresetName, setNewPresetName] = useState(""); // 新しいプリセット名
  const [selectedPresetMembers, setSelectedPresetMembers] = useState<Member[]>(
    []
  ); // 新しいプリセット用に選択されたメンバー

  useEffect(() => {
    const fetchPresets = async () => {
      const data = await getPresets(myLineId); // プリセットを非同期に取得
      if (data) {
        // nameを格納するための新しい配列を作成
        const namePresets = data.map((row) => ({
          name: row.name, // presetのnameも取得
          membersLineId: row.membersLineIds, // lineIdを取得
          membersName: row.membersLineIds.map((lineId) => {
            const member = members.find((member) => member.lineId === lineId);
            return member ? member.name : "データなし"; // memberが見つからない場合は"データなし"を返す
          }),
          presetId: row.presetId, // presetIdを取得
        }));

        setPresets(namePresets); //
      }
    };
    fetchPresets(); // プリセットを取得
  }, [myLineId, members]); // myLineIdやmembersが変更されたときに再実行

  //setPresetsLineIdとsetPresetsからpresetを削除
  const deletePreset = async (index: number) => {
    if (presets) {
      await deletePresets(myLineId, presets[index].presetId); // firebaseから削除
      const newPresets = presets?.filter((_, i) => i !== index);
      setPresets(newPresets);
    }
  };

  const handleChange = (index: number) => {
    // 現在選択されているインデックスと新しいインデックスを比較
    if (selectedIndex === index) {
      console.log("selectedIndex", index);
      setSelectedIndex(null); // 選択を解除
    } else {
      console.log("selectedIndex", index);
      setSelectedIndex(index); // 新しいインデックスを設定
    }
  };

  const handleSubmit = () => {
    if (selectedIndex !== null && selectedIndex !== undefined && presets) {
      //lineIdからmemberの配列に変換
      const selectedMembers = presets[selectedIndex].membersLineId.map(
        (lineId) => {
          const member = members.find((member) => member.lineId === lineId);
          if (!member) {
            Swal.fire({
              icon: "warning",
              title: "エラー",
              text: "メンバーが見つかりませんでした、プリセットを削除してください",
              confirmButtonText: "OK",
            });
            throw new Error("メンバーが見つかりませんでした");
          }
          return member;
        }
      );
      setSelectedMembers(selectedMembers); // 選択されたメンバーを設定
      onClose(); // ポップアップを閉じる
    } else {
      Swal.fire({
        icon: "warning",
        title: "注意",
        text: "プリセットを選択してください",
        confirmButtonText: "OK",
      });
    }
  };

  // 追加プリセットポップアップを閉じる関数
  const closeAddPresetPopup = () => {
    setIsAddPresetVisible(false);
    setNewPresetName("");
    setSelectedPresetMembers([]);
  };

  // メンバー選択の処理
  const handleAddSelectedPresetMembers = (member: Member) => {
    setSelectedPresetMembers((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m.lineId !== member.lineId)
        : [...prev, member]
    );
  };

  // 新しいプリセットを追加する関数
  const handleAddPreset = async () => {
    if (selectedPresetMembers.length === 0) {
      showWarning("メンバーを選択してください");
      return;
    }
    // メンバーのlineIdを抽出
    const memberLineIds = selectedPresetMembers.map((member) => member.lineId);

    try {
      // プリセットを追加
      await addPresets(myLineId, memberLineIds, newPresetName);
      // 成功メッセージ
      showSuccess("プリセットを追加しました");
      // プリセット一覧を更新
      const data = await getPresets(myLineId);
      if (data) {
        const namePresets = data.map((row) => ({
          name: row.name,
          membersLineId: row.membersLineIds,
          membersName: row.membersLineIds.map((lineId) => {
            const member = members.find((member) => member.lineId === lineId);
            return member ? member.name : "データなし";
          }),
          presetId: row.presetId,
        }));
        setPresets(namePresets);
      }
    } catch (error) {
      console.error("プリセット追加エラー:", error);
      showError("プリセットの追加に失敗しました");
    }
    // ポップアップを閉じる
    closeAddPresetPopup();
  };
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg  px-6 pb-6 pt-3 w-4/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">プリセットを選んでください</h2>
          <button
            className="text-lg font-bold hover:text-gray-800 focus:outline-none"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="h-40 overflow-y-auto border border-blue-200 rounded p-2">
          {!presets || presets.length === 0 ? (
            <p className="text-center text-gray-500">
              プリセットはまだ登録されていません。
            </p>
          ) : (
            presets.map((preset, index) => (
              <div
                key={preset.presetId}
                className="flex items-center justify-between p-1 hover:bg-blue-100 rounded"
              >
                <label
                  htmlFor={`${preset.presetId}-${index}`} // IDに名前を使用
                  className="cursor-pointer user-select-none"
                >
                  <input
                    type="checkbox"
                    id={`${preset.presetId}-${index}`} // IDに名前を使用
                    name="preset"
                    checked={selectedIndex === index}
                    onChange={() => handleChange(index)}
                    className="appearance-none h-3 w-3 border border-blue-200 rounded-full checked:bg-blue-500 checked:border-transparent focus:outline-none cursor-pointer flex-shrink-0"
                  />
                  <span className="ml-2">
                    {preset.name ? `${preset.name}：` : ""}{" "}
                    {preset.membersName.join("、")}
                  </span>{" "}
                  {/* 名前とメンバーを表示 */}
                </label>
                {presets !== undefined && (
                  <div className="flex items-center justify-center w-4 h-4 bg-red-500 rounded-full flex-shrink-0">
                    <button
                      className="text-white text-xs"
                      onClick={() => deletePreset(index)}
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {presets !== undefined && (
          <div className="flex justify-around mt-4">
            <button
              className="p-2 bg-green-500 text-white rounded-full w-20"
              onClick={() => {
                setIsAddPresetVisible(true); // 追加プリセットのpopupを表示
              }}
            >
              追加
            </button>
            <button
              className="p-2 bg-blue-500 text-white rounded-full w-20"
              onClick={handleSubmit} // 決定ボタンのクリックハンドラ
            >
              決定
            </button>
          </div>
        )}

        {/* 追加プリセットのポップアップ */}
        {isAddPresetVisible && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={closeAddPresetPopup}
          >
            <div
              className="bg-white rounded-lg shadow-lg px-6 pb-6 pt-3 w-4/5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">
                  新しいプリセットを作成
                </h2>
                <button
                  className="text-lg font-bold hover:text-gray-800 focus:outline-none"
                  onClick={closeAddPresetPopup}
                >
                  &times;
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  プリセット名
                </label>
                <input
                  type="text"
                  className="border border-blue-200 rounded p-1 mb-1 w-full"
                  placeholder="プリセットの名前(必要ならば)"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  メンバーを選択
                </label>
                <MemberList
                  members={members}
                  selectedMembers={selectedPresetMembers}
                  handleAddSelectedMembers={handleAddSelectedPresetMembers}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleAddPreset} // 追加ボタンのクリックハンドラ
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PresetPopup;
