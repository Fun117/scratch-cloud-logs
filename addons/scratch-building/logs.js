
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Scratch = require("scratch-api");
const config = require('../../_config.js');
const config_myAddon = require('./_config.js');
const { CharToNumberGET, NumberToCharGET } = require('../../src/CharToNumberGET.js');

const chatConfigPath = path.join(__dirname, '../../', 'config', 'selectChat.config.json');
const chatConfig = JSON.parse(fs.readFileSync(chatConfigPath, 'utf8'));

function formatTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

function FormatLog(isLog, type, time, status, account, user, name, value,) {
    if (type==='warn'){
        customFormat = config_myAddon.LogFormatWarn
    } else {
        customFormat = config_myAddon.LogFormat
    }
    let logMessage = customFormat
        .replace('{{time}}', time)
        .replace('{{status}}', status)
        .replace('{{account}}', account)
        .replace('{{user}}', user)
        .replace('{{name}}', name? `${name} : ` : ``)
        .replace('{{value}}', value);

    customFormat = config_myAddon.LogFormat_noColor
    let logMessage_noColor = customFormat
        .replace('{{time}}', time)
        .replace('{{status}}', status)
        .replace('{{account}}', account)
        .replace('{{user}}', user)
        .replace('{{name}}', name? `${name} : ` : ``)
        .replace('{{value}}', value);

    if (isLog) {
        console.log(logMessage);
    }

    return logMessage_noColor;
}

async function fetchCloudData(projectId, limit, offset) {
    const url = `https://clouddata.scratch.mit.edu/logs?projectid=${projectId}&limit=${limit}&offset=${offset}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        if (error.response) {
            // サーバーからのレスポンスがあるが、2xx ステータスコード以外
            console.error('Error fetching cloud data.', error.response.data);
            fs.appendFile(config_myAddon.file_logs, `>>> Error fetching cloud data. | ${nowTime}\n`, function(err) {
                if (err) return console.error('Error writing to log file:', err);
            });
            fs.appendFile(config_myAddon.file_chat, `>>> Error fetching cloud data. Server responded with: | ${nowTime}\n`, function(err) {
                if (err) return console.error('Error writing to log file:', err);
            });
        } else if (error.request) {
            // レスポンスがない場合、リクエストが失敗したとき
            console.error('Error fetching cloud data. No response received:', error.request);
            fs.appendFile(config_myAddon.file_logs, `>>> Error fetching cloud data. No response received | ${nowTime}\n`, function(err) {
                if (err) return console.error('Error writing to log file:', err);
            });
            fs.appendFile(config_myAddon.file_chat, `>>> Error fetching cloud data. No response received | ${nowTime}\n`, function(err) {
                if (err) return console.error('Error writing to log file:', err);
            });
        } else {
            // 何らかのその他のエラーが発生したとき
            console.error('Error fetching cloud data:', error.message);
            fs.appendFile(config_myAddon.file_logs, `>>> Error fetching cloud data. | ${nowTime}\n`, function(err) {
                if (err) return console.error('Error writing to log file:', err);
            });
            fs.appendFile(config_myAddon.file_chat, `>>> Error fetching cloud data. Server responded with: | ${nowTime}\n`, function(err) {
                if (err) return console.error('Error writing to log file:', err);
            });
        }
        console.error('Request config:', error.config);
        return null;
    }
}

Scratch.UserSession.load(function(err, user) {
    if (err) return console.error(err);

    Scratch.CloudSession._create(user, config.projectId, async function(err, cloud) {
        if (err) return console.error(err);
        const nowTime = formatTime(new Date());

        console.log('\n\u001b[38;5;35m> Server started. Waiting for cloud data...\n\u001b[0m');  // サーバー起動完了のログ
        fs.appendFile(config_myAddon.file_logs, `> Server started. Waiting for cloud data... | ${nowTime}\n`, function(err) {
            if (err) return console.error('Error writing to log file:', err);
        });
        fs.appendFile(config_myAddon.file_chat, `> Server started. Waiting for cloud data... | ${nowTime}\n`, function(err) {
            if (err) return console.error('Error writing to log file:', err);
        });

        const projectId = config.projectId;
        const limit = 10;
        const offset = 0;

        const cloudData = await fetchCloudData(projectId, limit, offset);

        if (!cloudData) {
            console.log('Failed to fetch cloud data.');
            return;
        }

        cloud.on('set', async function(name, value) {
            const currentTime = formatTime(new Date());
        
            // 最新のクラウドデータを取得
            const cloudData = await fetchCloudData(projectId, limit, offset);
            if (!cloudData) {
                console.log('Failed to fetch cloud data.');
                return;
            }
        
            // タイムスタンプでソート
            const sortedCloudData = cloudData.sort((a, b) => a.timestamp - b.timestamp);
        
            // 最も近いタイムスタンプのエントリを探す
            const closestEntry = sortedCloudData.find(entry => entry.value === value);
        
            if (closestEntry) {
                if (closestEntry.name === '☁ chat') {
                    const decryptedValue_username = NumberToCharGET('scratch_username', closestEntry.value.substring(0, 40)); // 復号化
                    const decryptedValue_chatId = closestEntry.value.substring(40);
                    const decryptedValue_chatId_ = chatConfig.menuOptions.find(option => option.number === decryptedValue_chatId);
                    const decryptedValue_chatValue = decryptedValue_chatId_.text;

                    if (closestEntry.user !== decryptedValue_username) {
                        var formatLog = FormatLog(
                            true,
                            'warn',
                            currentTime,
                            '400',
                            `（account: ${closestEntry.user}）`,
                            decryptedValue_username,
                            closestEntry.name,
                            closestEntry.value,
                        );

                        // console.log(`\u001b[38;5;42m[${currentTime}]\u001b[0m \u001b[38;5;220m[400] \u001b[38;5;208m${decryptedValue_username} (account: ${closestEntry.user}) / ${closestEntry.name} : ${closestEntry.value}\u001b[0m`);
                        fs.appendFile(config_myAddon.file_logs, `${formatLog}\n`, function(err) {
                            if (err) return console.error('Error writing to log file:', err);
                        });

                        var formatLog = FormatLog(
                            false,
                            'warn',
                            currentTime,
                            '400',
                            `（account: ${closestEntry.user}）`,
                            decryptedValue_username,
                            '',
                            decryptedValue_chatValue,
                        );
                        fs.appendFile(config_myAddon.file_chat, `${formatLog}\n`, function(err) {
                            if (err) return console.error('Error writing to log file:', err);
                        });
                    } else {
                        // console.log(`\u001b[38;5;42m[${currentTime}]\u001b[0m \u001b[38;5;76m[200]\u001b[0m ${closestEntry.user} / ${closestEntry.name} : ${closestEntry.value}`);
                        var formatLog = FormatLog(
                            true,
                            'log',
                            currentTime,
                            '200',
                            closestEntry.user,
                            '',
                            closestEntry.name,
                            closestEntry.value,
                        );

                        fs.appendFile(config_myAddon.file_logs, `${formatLog}\n`, function(err) {
                            if (err) return console.error('Error writing to log file:', err);
                        });

                        var formatLog = FormatLog(
                            false,
                            'log',
                            currentTime,
                            '200',
                            closestEntry.user,
                            '',
                            '',
                            decryptedValue_chatValue,
                        );
                        fs.appendFile(config_myAddon.file_chat, `${formatLog}\n`, function(err) {
                            if (err) return console.error('Error writing to log file:', err);
                        });
                    }
                } else {
                    var formatLog = FormatLog(
                        true,
                        'log',
                        currentTime,
                        '200',
                        closestEntry.user,
                        '',
                        closestEntry.name,
                        closestEntry.value,
                    );

                    fs.appendFile(config_myAddon.file_logs, `${formatLog}\n`, function(err) {
                        if (err) return console.error('Error writing to log file:', err);
                    });
                }
            } else {
                console.log(`No matching entry found for value: ${value}`);
            }
        });
    });
});

// プロセスが終了したときにメッセージを出力
process.on('exit', function() {
    const nowTime = formatTime(new Date());

    console.log('\u001b[38;5;38m> addons/scratch-building/logs.js closed. Logs saved to cloud.log.\n\u001b[0m');
    try {
        fs.appendFileSync(config_myAddon.file_logs, `> Received SIGINT. Closing server... | ${nowTime}\n\n`);
        fs.appendFileSync(config_myAddon.file_chat, `> Received SIGINT. Closing server... | ${nowTime}\n\n`);
    } catch (err) {
        console.error('Error writing to log file:', err);
    }
});

process.on('SIGINT', function() {
    console.log('Received SIGINT. Closing server...\n');
    process.exit(0);
});