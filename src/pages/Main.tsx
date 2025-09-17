import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLineId } from "../context/LineIdContext"; // 修正: LineIdConstext -> LineIdContext
import { initLiff } from "../liff/liffService";
import { useEffect, useState } from "react";

const Main = () => {
  const { setLineId } = useLineId();
  const [loading, setLoading] = useState(true); // ローディング状態を管理
  const [error, setError] = useState<string | null>(null); // エラーメッセージを管理
  const navigate = useNavigate(); // useNavigateフックを使用
  const location = useLocation(); // useLocationフックを使用

  useEffect(() => {
    const fetchLineId = async () => {
      try {
        const lineId = await initLiff();
        setLineId(lineId);

        // // LINE IDが取得できた後にクエリパラメータをチェックして移動
        // const params = new URLSearchParams(location.search);
        // const redirectPage = params.get("redirect");
        // if (redirectPage) {
        //   navigate(`/${redirectPage}`);
        // }
      } catch (err) {
        setError("LINE IDの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchLineId();
  }, [setLineId, navigate, location.search]);

  if (loading) {
    return <p>LINE IDを取得中...</p>; // ローディング中のメッセージ
  }

  if (error) {
    return <p>{error}</p>; // エラーメッセージの表示
  }

  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/Meikou">名工ページへ</Link>
          </li>
          <li>
            <Link to="/Kinjyou">金城ページへ</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Main;
