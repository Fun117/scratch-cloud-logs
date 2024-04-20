
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Scratch = require("scratch-api");
const config = require('./_config.js');

const chatConfigPath = path.join(__dirname, './', 'config', 'selectChat.config.json');
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

async function fetchCloudData(projectId, limit, offset) {
    const url = `https://clouddata.scratch.mit.edu/logs?projectid=${projectId}&limit=${limit}&offset=${offset}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        if (error.response) {
            // Response from server, but other than 2xx status code
            console.error('Error fetching cloud data. Server responded with:', error.response.data);
        } else if (error.request) {
            // If there is no response, when the request fails
            console.error('Error fetching cloud data. No response received:', error.request);
        } else {
            // When some other error occurs
            console.error('Error fetching cloud data:', error.message);
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

        console.log('\u001b[38;5;35m> Server started. Waiting for cloud data...\n\u001b[0m');  // Server startup completion log
        fs.appendFile(config.file_logs, `> Server started. Waiting for cloud data... | ${nowTime}\n`, function(err) {
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
        
            // Get the latest cloud data
            const cloudData = await fetchCloudData(projectId, limit, offset);
            if (!cloudData) {
                console.log('Failed to fetch cloud data.');
                return;
            }
        
            // Sort by timestamp
            const sortedCloudData = cloudData.sort((a, b) => a.timestamp - b.timestamp);
        
            // Find the entry with the closest timestamp
            const closestEntry = sortedCloudData.find(entry => entry.value === value);
        
            if (closestEntry) {
                console.log(`\u001b[38;5;42m[${currentTime}]\u001b[0m ${closestEntry.user} / ${closestEntry.name} : ${closestEntry.value}`);

                fs.appendFile(config.file_logs, `[${currentTime}] ${closestEntry.user} / ${closestEntry.name} : ${closestEntry.value}\n`, function(err) {
                    if (err) return console.error('Error writing to log file:', err);
                });
            } else {
                console.log(`No matching entry found for value: ${value}`);
            }
        });
    });
});

// Output message when process terminates
process.on('exit', function() {
    const nowTime = formatTime(new Date());

    console.log('\u001b[38;5;38mIndex.js closed. Logs saved to cloud.log.\n\u001b[0m');
    try {
        fs.appendFileSync(config.file_logs, `> Received SIGINT. Closing server... | ${nowTime}\n\n`);
    } catch (err) {
        console.error('Error writing to log file:', err);
    }
});

process.on('SIGINT', function() {
    console.log('Received SIGINT. Closing server...\n');
    process.exit(0);
});