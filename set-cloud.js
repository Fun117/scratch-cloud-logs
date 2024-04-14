const Scratch = require('scratch-api');
const config = require('./config.js');

if (process.argv.length < 4) {
    console.error('Usage: node set-cloud.js <key> <content>');
    process.exit(1);
}

const key = process.argv[2];
const content = process.argv[3];

Scratch.UserSession.load(async function(err, user) {
    if (err) {
        console.error('Error loading session:', err);
        process.exit(1);
    }

    user.cloudSession(config.projectId, async function(err, cloud) {
        if (err) {
            console.error('Error connecting to cloud session:', err);
            process.exit(1);
        }

        cloud.set(key, content);
        console.log(`> successfully | Set ${key} to ${content}`);
        process.exit(0); // スクリプトの正常終了
    });
});
