# PMC プロジェクト (reactailwind)

## ルール

* 日本語で答えてください

## プロジェクト概要

このウェブアプリケーションは、**React**、**TypeScript**、**Vite** を用いて構築されています。スタイリングには **Tailwind CSS**、バックエンドサービスには **Firebase** を利用しています。また、LINE Front-end Framework (LIFF) とも連携しています。

## 主要技術

  * **フロントエンド:** React, TypeScript
  * **ビルドツール:** Vite
  * **スタイリング:** Tailwind CSS
  * **バックエンド & データベース:** Firebase
  * **LINE連携:** LIFF SDK
  * **ルーティング:** React Router
  * **リンティング:** ESLint

-----

## セットアップと開発

1.  **依存関係のインストール:**

    ```bash
    npm install
    ```

2.  **開発サーバーの起動:**

    ```bash
    npm run dev
    ```

    このコマンドを実行すると、Vite 開発サーバーが起動します。通常、`http://localhost:5173` でアクセス可能です。

-----

## プロジェクトのビルド

本アプリケーションのプロダクション向けビルドを作成するには、以下のコマンドを実行します。出力ファイルは `dist` ディレクトリに配置されます。

```bash
npm run build
```

-----

## リンティング

ESLint を使用してコードのスタイルチェックや潜在的なエラーの確認を行うには、以下のコマンドを実行します。

```bash
npm run lint
```

-----

## デプロイ

このプロジェクトは GitHub Pages へのデプロイが設定されています。以下のコマンドを実行すると、まずプロジェクトがビルドされ、その後 `dist` ディレクトリの内容がデプロイされます。

```bash
npm run deploy
```