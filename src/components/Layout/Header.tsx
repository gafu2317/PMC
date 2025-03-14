// import { useState } from "react";
// import { UserInstructions } from "../Popup";

const Header = () => {
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
      {/* {isShow && <UserInstructions onClose={()=>setIsShow(false)} />} */}
    </div>
  );
};

export default Header;
