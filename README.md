# Scratch Cloud API Logger

このプロジェクトはScratch Cloud APIを使用してクラウド変数の変更をロギングするためのNode.jsスクリプトです。

## 概要

このスクリプトは、Scratchのプロジェクトに接続し、クラウド変数の変更をリアルタイムでキャッチしてログに記録します。ログは`cloud-logs.log`ファイルに保存されます。

## 前提条件

- Node.jsがインストールされていること
- `config.js` ファイルにプロジェクトIDが設定されていること

## インストール

```bash
npm install
```

# 使用方法

## `config.js` ファイルにプロジェクトIDを設定します。
```js
module.exports = {
    projectId: 'your_project_id_here'
};
```

## スクリプトを実行します。
```bash
node index.js
```

# ログファイル

ログは `cloud-logs.log` ファイルに保存されます。このファイルはGitリポジトリには含まれません。

# 注意事項

このスクリプトはScratchのAPIを使用しているため、Scratchの利用規約に従って使用してください。