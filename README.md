# Scratch Cloud API Logger

This project is a Node.js script designed to log changes to cloud variables using the Scratch Cloud API.

[English](./README.md) / [日本語](./README/ja.md)

## Overview

This script connects to a Scratch project and captures real-time changes to cloud variables, logging them to a file named `cloud.log`.

## Prerequisites

- Node.js installed
- Project ID set in `config.js` file

## Installation

```bash
npm install
```

# Usage

## Set your Project ID in `config.js` file.
```js
module.exports = {
    projectId: 'your_project_id_here'
};
```

## Run the script.
```bash
npm start
```

# Log File

Logs are saved to a file named `cloud.log`. This file is not included in the Git repository.

# Notes

This script uses the Scratch API, so please use it in accordance with Scratch's terms of service.