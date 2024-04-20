# Scratch Cloud API Logger

This project is a Node.js script designed to log changes to cloud variables using the Scratch Cloud API.

[English](./README.md) / [日本語](./README/ja.md)

## Overview

This script connects to a Scratch project and logs real-time changes to cloud variables. The logs are saved in the `cloud.log` file.

## Prerequisites

- Node.js installed
- `config.js` file configured with your project ID

## Installation

```bash
npm install
```

# Configuration

## Set your Project ID in `config.js` file.
```js
module.exports = {
    projectId: 'your_project_id_here'
};
```

# Usage

## Run the script.
```bash
npm start
```

# Log File

Logs are saved in the `cloud.log` file. This file is not included in the Git repository.

# Notes

Please adhere to Scratch's terms of use when using this script, as it utilizes the Scratch API.

```bash
npm start
```

# Addons

## Scratch Building

### Log

You can monitor the communication of cloud data. You can check if the user has modified the chat information in the Scratch Building game. Currently, only the chat has a feature to confirm if the changes were made by the user.

Log: logs/scratch-building.log
Chat log: logs/scratch-building-chat.log

```bash
node addons/scratch-building/logs.js
```

### Chat

You can chat specifying a username. However, it's not recommended for gameplay, as it cannot confirm if the sender is the actual user. Use this feature responsibly; we are not responsible if you lose access to the game.

```bash
node addons/scratch-building/chat.js <username>
```