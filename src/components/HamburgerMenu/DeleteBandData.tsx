import React, { useState } from "react";
import { Band } from "../../types/type";
import { deleteBand } from "../../firebase/userService";

interface DeleteBandDataProps {
  bands: Band[];
}

const DeleteBandData: React.FC<DeleteBandDataProps> = ({ bands }) => {
  const [searchTerm, setSearchTerm] = useState(""); // 検索キーワードを管理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const [selectedBands, setSelectedBands] = useState<Set<string>>(new Set()); // 選択されたバンドのIdを管理
  const filteredBands = bands.filter((band) => band.name.includes(searchTerm));
  const selectAllBand = () => {
    if (selectedBands.size === filteredBands.length) {
      // 全て選択されている場合は解除
      setSelectedBands(new Set());
    } else {
      // 全て選択
      const allSelected = new Set(filteredBands.map((band) => band.bandId));
      setSelectedBands(allSelected);
    }
  };

  const toggleSelectBand = (bandId: string) => {
    setSelectedBands((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(bandId)) {
        newSelected.delete(bandId);
      } else {
        newSelected.add(bandId);
      }
      return newSelected;
    });
  };
  const [loading, setLoading] = useState(false); // ローディング状態を管理
  const handleDeleteBands = async () => {
    for (const bandId of selectedBands) {
      setLoading(true);
      await deleteBand(bandId);
      setLoading(false);
      setSelectedBands(new Set());
    }
    setSelectedBands(new Set());
  };

  return (
    <div>
      <div>
        <h2 className="mb-2">バンドデータの削除</h2>
        <input
          type="text"
          placeholder="名前(一部でも可)"
          className="border rounded p-1 mb-2 w-full"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {filteredBands.length > 0 && (
          <div>
            <button
              className="bg-blue-500 text-white rounded p-1 "
              onClick={selectAllBand}
            >
              {selectedBands.size === filteredBands.length
                ? "すべて解除"
                : "すべて選択"}
            </button>
            <ul className="mt-4">
              {filteredBands.map((band) => (
                <li
                  key={band.bandId}
                  className="flex items-center border-b py-1"
                >
                  <input
                    type="checkbox"
                    checked={selectedBands.has(band.bandId)}
                    onChange={() => toggleSelectBand(band.bandId)}
                    className="mr-2"
                  />
                  {band.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button
            className="bg-red-500 text-white rounded p-1"
            onClick={handleDeleteBands}
          >
            削除
          </button>
          {loading && <span>削除中...</span>}
        </div>
      </div>
    </div>
  );
};

export default DeleteBandData;
