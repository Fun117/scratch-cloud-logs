const Scratch = require('scratch-api');
const config = require('../../_config.js');

async function ScratchCloudSET(key, content) {
    return new Promise((resolve, reject) => {
        Scratch.UserSession.load(async function(err, user) {
            if (err) {
                reject(`Error loading session: ${err}`);
                return;
            }

            user.cloudSession(config.projectId, async function(err, cloud) {
                if (err) {
                    reject(`Error connecting to cloud session: ${err}`);
                    return;
                }

                cloud.set(`☁ ${key}`, content);
                console.log(`\u001b[38;5;35m> successfully | Set ${key} to ${content}\u001b[0m`);
                resolve(); // 関数の正常終了
            });
        });
    });
}

module.exports = ScratchCloudSET;
