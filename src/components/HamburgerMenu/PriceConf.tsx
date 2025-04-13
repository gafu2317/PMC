import React,{useState} from "react";

interface PriceConfProps {}

const PriceConf: React.FC<PriceConfProps> = () => {
  const [startDate, setStartDate] = useState(""); // 開始日を管理
  const [endDate, setEndDate] = useState(""); // 終了日を管理
  const [isAll, setIsAll] = useState(true); //全て選択されているかどうか

  const handleConf = async () => {
  }
  return (
    <div>
      <h2 className="text-lg text-center mb-2">先に料金計算をしてください</h2>
      <h2 className="text-sm mb-2">このボタンを押すと以下が実行されます</h2>
      <ul className="list-disc pl-5 mb-2">
        <li className="text-sm">料金を通知</li>
        <li className="text-sm">罰金,学スタ使用料,出演費を未払金に追加</li>
        <li className="text-sm">バンド全削除</li>
        <li className="text-sm">指定した期間の予約削除</li>
      </ul>
      <h2 className="mb-2">料金を計算した期間を入力</h2>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block my-1 text-xs">開始日</label>
          <input
            type="date"
            className="border rounded p-1 mb-2 w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1 text-xs">終了日</label>
          <input
            type="date"
            className="border rounded p-1 mb-2 w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-around mb-2">
        <button
          className={` text-sm rounded p-1 ${
            isAll ? "bg-green-400" : "bg-gray-300"
          }`}
          onClick={() => setIsAll(true)}
        >
          全ての期間
        </button>
        <button
          className={` text-sm rounded p-1 ${
            isAll ? "bg-gray-300" : "bg-green-400"
          }`}
          onClick={() => setIsAll(false)}
        >
          指定した期間
        </button>
      </div>
      <div className="flex justify-center my-2 items-center">
        <button
          className="bg-gray-300 rounded p-1 w-24 text-lg"
          onClick={()=> handleConf()}
        >
          料金確定
        </button>
      </div>
    </div>
  );
};

export default PriceConf;
