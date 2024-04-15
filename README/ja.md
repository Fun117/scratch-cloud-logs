# Scratch Cloud API Logger

このプロジェクトはScratch Cloud APIを使用してクラウド変数の変更をロギングするためのNode.jsスクリプトです。

[English](../README.md) / [日本語](./ja.md)

## 概要

このスクリプトは、Scratchのプロジェクトに接続し、クラウド変数の変更をリアルタイムでキャッチしてログに記録します。ログは`cloud.log`ファイルに保存されます。

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
npm start
```

# ログファイル

ログは `cloud.log` ファイルに保存されます。このファイルはGitリポジトリには含まれません。

# 注意事項

このスクリプトはScratchのAPIを使用しているため、Scratchの利用規約に従って使用してください。

# 機能一覧

## データ監視
クラウドデータの通信を確認することが出来ます。ビル経営ゲームのチャットの情報は、本人が変更したかどうかを確認することができます。現在はチャットのみ本人確認機能が対応しています。
```bash
npm start
```

## チャット
```bash
node src/scratch-building/chat.js <ユーザー名>
```