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

This add-on was created to simplify the monitoring of cloud data communication for Scratch Building games.

### Log

You can monitor the communication of cloud data. Currently, the user verification feature is only supported for chat communication.

Log: `logs/scratch-building.log`
Chat log: `logs/scratch-building-chat.log`

```bash
node addons/scratch-building/logs.js
```

### Chat

You can chat specifying a username. While it's possible to impersonate the sender within the game, monitoring API communication allows you to identify whether the sender is the actual user. Therefore, using this feature is not recommended. We cannot take responsibility if using this feature disrupts gameplay.

```bash
node addons/scratch-building/chat.js <username>
```

### Customizing Logs

You can customize the display by adjusting the `LogFormat` set in the configuration file `addons/scratch-building/_config.js`.

- **LogFormat**: Defines the format for standard server logs, including color configurations.
- **LogFormatWarn**: Specifies the format for warning logs, handling logs at a warning level.
- **LogFormat_noColor**: Sets the format for logs without colors, excluding any color configurations.

Utilize these settings to tailor the content and presentation of your logs to your needs.
