// config.js
module.exports = {
    file_logs: "./logs/scratch-building.log", // ログを保存するファイル名
    file_chat: "./logs/scratch-building-chat.log", // チャットログを保存するファイル名
    LogFormat: `\u001b[38;5;42m[{{time}}]\u001b[0m \u001b[38;5;76m[{{status}}]\u001b[0m {{user}} {{account}} / {{name}} : {{value}}`,
    LogFormatWarn: `\u001b[38;5;42m[{{time}}]\u001b[0m \u001b[38;5;220m[{{status}}]\u001b[0m \u001b[38;5;208m{{user}} {{account}} / {{name}} : {{value}}\u001b[0m`,
    LogFormat_noColor: `[{{time}}] [{{status}}] {{user}} {{account}} / {{name}} : {{value}}`,
};