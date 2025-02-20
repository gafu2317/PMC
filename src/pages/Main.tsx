
import { Link } from 'react-router-dom'

const Main = () => {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/meikou">名工ページへ</Link>
          </li>
          <li>
            <Link to="/kinjyou">金城ページへ</Link>
          </li>
        </ul>
      </nav>
      {/* 他のコンポーネントや内容をここに追加 */}
    </div>
  );
}

export default Main
