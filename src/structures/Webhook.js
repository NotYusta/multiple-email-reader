const { Webhook } = require('discord-webhook-node');
const fs = require('fs');
let delay = 2 * 1000;
async function webhook(url) {
    if(url != null) {
        const path = './src/output/output.txt';
        if(url.toString().startsWith('https://discord.com/api/webhooks')) {
            const hook = new Webhook(url);
            fs.access(path, fs.F_OK, (err) => {
                if (err) {
                    console.error(err)
                }
                setTimeout(function(){}, delay);
                hook.sendFile(path);
            });
        } else {
            console.log('Invalid webhook url!');
        }
    }
}

module.exports = (url) => webhook(url);