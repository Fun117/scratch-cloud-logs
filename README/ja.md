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

# 構成

## `config.js` ファイルにプロジェクトIDを設定します。
```js
module.exports = {
    projectId: 'your_project_id_here'
};
```

# 使用方法

## スクリプトを実行します。
```bash
npm start
```

# ログファイル

ログは `cloud.log` ファイルに保存されます。このファイルはGitリポジトリには含まれません。

# 注意事項

このスクリプトはScratchのAPIを使用しているため、Scratchの利用規約に従って使用してください。

# アドオン

## Scratch Building

### ログ

クラウドデータの通信を確認することが出来ます。ビル経営ゲームのチャットの情報は、本人が変更したかどうかを確認することができます。現在はチャットのみ本人確認機能が対応しています。

ログ：`logs/scratch-building.log`
チャットログ：`logs/scratch-building-chat.log`,

```bash
node addons/scratch-building/logs.js
```

### チャット

ユーザー名を指定してチャットをすることができます。しかし、ゲーム内では本人かどうかは確認できませんが、送信者が本人なのかは特定することができるため使用をお勧めしません。この機能を使用してゲームのプレイが出来なくなっても出来なくなっても責任は負いません。

```bash
node addons/scratch-building/chat.js <username>
```