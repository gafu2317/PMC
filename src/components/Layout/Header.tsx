import { setBaseDate, getBaseDate } from "../../utils/utils";
import { emitter } from "../../utils/utils";
import { useEffect, useState } from "react";
// import { UserInstructions } from "../Popup";

const Header = () => {
  const [isThisWeek, setIsThisWeek] = useState(false);

  // baseDateの変更を監視する
  useEffect(() => {
    const updateIsThisWeek = () => {
      const isThisWeek = new Date().getDate() === getBaseDate().getDate();
      setIsThisWeek(isThisWeek);
    };

    // イベントリスナーを登録
    emitter.on("baseDateChanged", updateIsThisWeek);

    // 初期値の設定
    updateIsThisWeek();

    // コンポーネントがアンマウントされる際にリスナーを解除
    return () => {
      emitter.off("baseDateChanged", updateIsThisWeek);
    };
  }, []);
  // const [isShow, setIsShow] = useState(false);

  // const handleClick = () => {
  //   setIsShow(!isShow);
  // };
  return (
    <div className="mb-2 text-center max-w-sm">
      <div className="flex justify-around text-sm items-center text-xs">
        <span className="inline-block w-4 h-4 bg-white rounded border border-gray-400"></span>{" "}
        予約可能
        <span className="inline-block w-4 h-4 bg-gray-300 rounded"></span>{" "}
        予約済み
        <span className="inline-block w-4 h-4 bg-green-500 rounded"></span>{" "}
        自分の予約
        <span className="inline-block w-4 h-4 bg-red-500 rounded text-white"></span>{" "}
        予約の重複
        {/* <button
          className="rounded-full w-4 h-4 flex items-center justify-center border border-black"
          onClick={handleClick}
        >
          ?
        </button> */}
      </div>
      <div className="flex justify-around">
        <button
          className={`mt-2  text-sm rounded-md px-2 ${
            isThisWeek ? `bg-gray-200 text-gray-400` : `bg-blue-200`
          }`}
          onClick={() => setBaseDate(new Date())}
        >
          今週を表示
        </button>
        <button
          className={`mt-2  text-sm rounded-md px-2 ${
            isThisWeek ? `bg-blue-200` : `bg-gray-200 text-gray-400`
          }`}
          onClick={() =>
            setBaseDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
          }
        >
          来週を表示
        </button>
      </div>
      {/* {isShow && <UserInstructions onClose={()=>setIsShow(false)} />} */}
    </div>
  );
};

export default Header;
