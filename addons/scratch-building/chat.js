const { CharToNumberGET } = require('../../src/CharToNumberGET.js');
const SelectChat = require('./comps/selectChat.js');
const ScratchCloudSET = require('../../src/_cloud/set.js');

if (process.argv.length < 3) {
    console.error('Usage: node ./addons/scratch-building/chat.js <username>');
    process.exit(1);
}

const username = process.argv[2];

const CharToNumber_username = CharToNumberGET("scratch_username", username);

SelectChat((selectedMessage) => {
    console.log(`ユーザー名：${username}`);
    console.log(`選択されたメッセージ：${selectedMessage.text}`);
    console.log(`メッセージ番号：${selectedMessage.number}`);
    const send_data = CharToNumber_username + selectedMessage.number;

    // ScratchCloudSET を非同期で実行
    async function run() {
        try {
            await ScratchCloudSET("chat", send_data);
            setTimeout(() => {
                process.exit(0)
            }, 1000);
        } catch (error) {
            console.error(`Error sending data: ${error}`);
            process.exit(1); // エラー時にもプロンプトを閉じる
        }
    }
    run();
});
