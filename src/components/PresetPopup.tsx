import React, { useEffect, useState } from "react";
import { Member } from "../types/type";
import { getPresets, deletePresets } from "../firebase/userService";

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

  const [presetsLineId, setPresetsLineId] = useState<string[][] | undefined>(
    undefined
  ); // presetsの状態
  const [presets, setPresets] = useState<string[][] | undefined>(undefined); // presetsの状態
  useEffect(() => {
    const fetchPresets = async () => {
      const data = await getPresets(myLineId); // プリセットを非同期に取得
      if (data) {
        setPresetsLineId(data); // 取得したデータをセット
        // nameを格納するための新しい配列を作成
        const namePresets = data.map((row) =>
          row.map((lineId) => {
            const member = members.find((member) => member.lineId === lineId);
            return member ? member.name : "データなし"; // memberが見つからない場合はlineIdをそのまま返す
          })
        );

        setPresets(namePresets); // nameを含む新しいデータをセット
      }
    };

    fetchPresets(); // プリセットを取得
  }, [presetsLineId, presets]); // myLineIdやmembersが変更されたときに再実行
  //setPresetsLineIdとsetPresetsからpresetを削除
  const deletePreset = (index:number) => {
    if(presetsLineId){
      deletePresets(myLineId, presetsLineId[index]);
      const newPresetsLineId = presetsLineId?.filter((_, i) => i !== index);
      setPresetsLineId(newPresetsLineId);
      const newPresets = presets?.filter((_, i) => i !== index);
      setPresets(newPresets);
    }
  }

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // 選択されたプリセットの番号を管理
  const handleChange = (index: number) => {
    // 現在選択されているインデックスと新しいインデックスを比較
    if (selectedIndex === index) {
      setSelectedIndex(null); // 選択を解除
    } else {
      setSelectedIndex(index); // 新しいインデックスを設定
    }
  };

  const handleSubmit = () => {
    if (
      selectedIndex !== null &&
      selectedIndex !== undefined &&
      presetsLineId
    ) {
      //lineIdからmemberの配列に変換
      const selectedMembers = presetsLineId[selectedIndex].map((lineId) => {
        const member = members.find((member) => member.lineId === lineId);
        if (!member) {
          alert("メンバーが見つかりませんでした、プリセットを削除してください");
          throw new Error("メンバーが見つかりませんでした");
        }
        return member;
      });
      setSelectedMembers(selectedMembers); // 選択されたメンバーを設定
      onClose(); // ポップアップを閉じる
    } else {
      alert("プリセットを選択してください");
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h2 className="text-xl font-semibold mb-4">
          使用するプリセットを選んでください
        </h2>
        <div className="h-40 overflow-y-auto border border-blue-200 rounded p-2">
          {!presets || presets.length === 0 ? (
            <p className="text-center text-gray-500">
              プリセットはまだ登録されていません。
            </p>
          ) : (
            presets.map((preset, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1"
              >
                <label
                  htmlFor={`${preset}-${index}`}
                  className="flex items-center cursor-pointer user-select-none"
                >
                  <input
                    type="checkbox"
                    id={`${preset}-${index}`}
                    name="preset"
                    value={preset.toString()}
                    checked={selectedIndex === index}
                    onChange={() => handleChange(index)}
                    className="appearance-none h-3 w-3 border border-blue-200 rounded-full checked:bg-blue-500 checked:border-transparent focus:outline-none cursor-pointer"
                  />
                  <span className="ml-2">{preset.join("、")}</span>
                </label>
                {presetsLineId !== undefined && (
                  <div className="flex items-center justify-center w-4 h-4 bg-red-500 rounded-full">
                    <button
                      className="text-white text-xs"
                      onClick={() =>
                        deletePreset(index)
                      }
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="p-2 text-black rounded-full w-20 bg-gradient-to-b from-gray-300 to-gray-400"
            onClick={onClose}
          >
            閉じる
          </button>
          {presets !== undefined && (
            <button
              className="p-2 bg-gradient-to-b from-sky-600 to-blue-700 text-white rounded-full w-20"
              onClick={handleSubmit} // 決定ボタンのクリックハンドラ
            >
              決定
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresetPopup;
