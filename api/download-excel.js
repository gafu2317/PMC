// api/download-excel.js
import * as XLSX from "xlsx";

// ふりがなで50音順にメンバーをソートする関数
const sortMembersByFurigana = (members) => {
  return [...members].sort((a, b) => {
    const furiganaA = a.furigana || a.name;
    const furiganaB = b.furigana || b.name;
    return furiganaA.localeCompare(furiganaB, 'ja', { 
      numeric: true, 
      sensitivity: 'base' 
    });
  });
};

// Excelファイルを生成する関数
const generateExcelFile = (members) => {
  const sortedMembers = sortMembersByFurigana(members);
  
  const worksheetData = [
    ['名前', 'ふりがな', '罰金', '出演費', '学スタ使用料', '未払金', '合計'],
    ...sortedMembers.map(member => [
      member.name,
      member.furigana,
      member.fine,
      member.performanceFee,
      member.studyFee,
      member.unPaidFee,
      member.fine + member.performanceFee + member.studyFee + member.unPaidFee
    ])
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '料金一覧');
  
  // バイナリデータとして出力
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'buffer'
  });
  
  return excelBuffer;
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { members } = req.body;

      if (!members || !Array.isArray(members)) {
        return res.status(400).json({ error: "members データが必要です" });
      }

      console.log(`Excel生成開始: ${members.length}人分のデータ`);
      
      // Excelファイルを生成
      const excelBuffer = generateExcelFile(members);
      const today = new Date().toISOString().split('T')[0];
      const filename = `料金一覧_${today}.xlsx`;
      
      console.log(`Excel生成完了: ${excelBuffer.length} bytes`);

      // ファイルダウンロード用のヘッダー設定
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Length', excelBuffer.length);
      
      // ファイルを直接レスポンスとして送信
      res.send(excelBuffer);

    } catch (error) {
      console.error("Excel生成エラー:", error);
      res.status(500).json({ 
        error: `Excel ファイル生成失敗: ${error.message}` 
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}