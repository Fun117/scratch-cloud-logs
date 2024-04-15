
const fs = require('fs');
const axios = require('axios');
const Scratch = require("scratch-api");
const config = require('./config.js');
const { CharToNumberGET, NumberToCharGET } = require('./src/CharToNumberGET.js');

function formatTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

async function fetchCloudData(projectId, limit, offset) {
    const url = `https://clouddata.scratch.mit.edu/logs?projectid=${projectId}&limit=${limit}&offset=${offset}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching cloud data:', error);
        return null;
    }
}

Scratch.UserSession.load(function(err, user) {
    if (err) return console.error(err);

    Scratch.CloudSession._create(user, config.projectId, async function(err, cloud) {
        if (err) return console.error(err);

        console.log('\u001b[38;5;35m> Server started. Waiting for cloud data...\n\u001b[0m');  // サーバー起動完了のログ

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
                    const decryptedValue = NumberToCharGET('scratch_username', closestEntry.value.substring(0, 20)); // 復号化
                                
                    if (closestEntry.user !== decryptedValue) {
                        console.log(`\u001b[38;5;42m[${currentTime}]\u001b[0m \u001b[38;5;220m[400] \u001b[38;5;208m${decryptedValue} (account: ${closestEntry.user}) / ${closestEntry.name} : ${closestEntry.value}\u001b[0m`);
                                    
                        fs.appendFile('cloud.log', `[${currentTime}] [400] ${decryptedValue} (account: ${closestEntry.user}) / ${closestEntry.name} : ${closestEntry.value}\n`, function(err) {
                            if (err) return console.error('Error writing to log file:', err);
                        });
                    } else {
                        console.log(`\u001b[38;5;42m[${currentTime}]\u001b[0m \u001b[38;5;76m[200]\u001b[0m ${closestEntry.user} / ${closestEntry.name} : ${closestEntry.value}`);

                        fs.appendFile('cloud.log', `[${currentTime}] [200] ${closestEntry.user} / ${closestEntry.name} : ${closestEntry.value}\n`, function(err) {
                            if (err) return console.error('Error writing to log file:', err);
                        });
                    }
                } else {
                    console.log(`\u001b[38;5;42m[${currentTime}]\u001b[0m \u001b[38;5;76m[200]\u001b[0m ${closestEntry.user} / ${closestEntry.name} : ${closestEntry.value}`);

                    fs.appendFile('cloud.log', `[${currentTime}] [200] ${closestEntry.user} / ${closestEntry.name} : ${closestEntry.value}\n`, function(err) {
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
    console.log('\u001b[38;5;38mIndex.js closed. Logs saved to cloud.log.\n\u001b[0m');
});

process.on('SIGINT', function() {
    console.log('Received SIGINT. Closing server...\n');
    process.exit(0);
});