require('dotenv').config();
const fs = require('fs');
const Scratch = require("scratch-api");
const config = require('./config.js');

// set .env
const env = process.env;

Scratch.UserSession.load(function(err, user) {
    if (err) return console.error(err);
    
    user.cloudSession(config.projectId, function(err, cloud) {
        if (err) return console.error(err);
        
        cloud.on('set', function(name, value) {
            const currentTime = new Date().toISOString();
            console.log(`[${currentTime}]`, name, value);

            // ログをファイルに追記
            fs.appendFile('cloud.log', `[${currentTime}] ${name}: ${value}\n`, function(err) {
                if (err) return console.error('Error writing to log file:', err);
            });
        });
    });
});

// プロセスが終了したときにメッセージを出力
process.on('exit', function() {
    console.log('Index.js closed. Logs saved to cloud.log.');
});
