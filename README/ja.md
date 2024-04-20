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

ビル経営ゲームのクラウドデータ通信の監視を簡単にするために作成されたアドオンです。

### ログ

クラウドデータの通信を確認することができます。現在、本人確認機能はチャットの通信にのみ対応しています。

ログ：`logs/scratch-building.log`
チャットログ：`logs/scratch-building-chat.log`,

```bash
node addons/scratch-building/logs.js
```

### チャット

ユーザー名を指定してチャットをすることができます。ゲーム内では送信者を偽造することが可能ですが、API通信を監視することで送信者が本人であるかどうかを特定できます。そのため、この機能の使用は推奨されません。この機能を使用してゲームのプレイに支障が出た場合、責任を負いかねます。

```bash
node addons/scratch-building/chat.js <username>
```