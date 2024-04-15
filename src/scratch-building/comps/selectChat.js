const readline = require('readline');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../../', 'config', 'selectChat.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const menuOptions = config.menuOptions;
const itemsPerPage = config.itemsPerPage;

let selectedIndex = 0;
let currentPage = 0;

function SelectChat(callback) {
    // readlineインターフェースの作成
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
    });

    function getCurrentPageItems() {
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        return menuOptions.slice(start, end);
    }

    function displayMenu() {
        console.clear(); 
        console.log('\nチャットを選択\n');
        getCurrentPageItems().forEach((option, index) => {
            const itemIndex = currentPage * itemsPerPage + index;
            if (itemIndex === selectedIndex) {
                console.log(`\u001b[38;5;38m> ${option.text} (${option.number})\u001b[0m`);
            } else {
                console.log(`  ${option.text} (${option.number})`);
            }
        });
        console.log(`\n--- ページ ${currentPage + 1} / ${Math.ceil(menuOptions.length / itemsPerPage)} ---`);
    }

    displayMenu();

    rl.input.on('keypress', (key, data) => {
        if (data.name === 'up') {
            selectedIndex = Math.max(selectedIndex - 1, 0);
            if (selectedIndex < currentPage * itemsPerPage) {
                currentPage = Math.max(currentPage - 1, 0);
            }
            displayMenu();
        } else if (data.name === 'down') {
            selectedIndex = Math.min(selectedIndex + 1, menuOptions.length - 1);
            if (selectedIndex >= (currentPage + 1) * itemsPerPage) {
                currentPage = Math.min(currentPage + 1, Math.floor(menuOptions.length / itemsPerPage));
            }
            displayMenu();
        } else if (data.name === 'left') {
            currentPage = Math.max(currentPage - 1, 0);
            selectedIndex = currentPage * itemsPerPage;
            displayMenu();
        } else if (data.name === 'right') {
            currentPage = Math.min(currentPage + 1, Math.floor((menuOptions.length - 1) / itemsPerPage));
            selectedIndex = currentPage * itemsPerPage;
            displayMenu();
        } else if (data.name === 'return') {
            const selectedMessage = menuOptions[selectedIndex];
            console.clear();
            callback(selectedMessage);
            rl.close();
        }
    });

    // 終了時の処理
    rl.on('close', () => {
        rl.close();
    });
}

// selectChat関数をエクスポート
module.exports = SelectChat;