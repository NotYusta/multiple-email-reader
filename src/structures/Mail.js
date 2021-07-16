const Imap = require('imap');
const inspect = require('util').inspect;
const webhook = require('./Webhook');
const config = require('../../.config.js');

function mail(user, password, host, port, tls, id, enableWebhook) {
    const imap = new Imap({
        user: user,
        password: password,
        host: host,
        port: port,
        tls: tls
    });
    function openInbox(callback) {
        imap.openBox('Inbox', false, callback);
    }
    console.log(`${user} - #${id}`);
    let prefix = '';
    imap.once('ready', () => {
        openInbox((err, box) => {
            if (err) throw err;
            imap.search(['UNSEEN'], function(err, results) {
                if(results.length != 0 && results != null) {
                    console.log(results);
                    let f = imap.fetch(results, {
                        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                        struct: true,
                        markSeen: true
                    });
                    f.on('message', (msg, seqno) => {
                        prefix = `(MSG #${seqno}) - (ID #${id}) `;
                        
                        console.log(prefix + box.messages.total + ' Messages inbox');
                        msg.on('body', (stream, info) => {
                            let buffer = '';
                            stream.on('data', (chunk) => {
                                buffer += chunk.toString('utf8');
                            });
                            stream.once('end', () => {
                                console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
                            });
                        });
                    });
                    f.once('error', (err) => {
                        console.log(prefix + 'Fetch error: ' + err);
                    });
                    f.once('end', () => {
                        console.log(prefix + 'Done fetching all messages!');
                        imap.end();
                    });
                } else {
                    console.log(`No unread messages, current messages inbox: ${box.messages.total}`);
                    imap.end();
                }
            });
        });
    });
    imap.once('error', (err) => {
        console.log(err);
    });
       
    imap.once('end', () => {
        console.log(prefix + 'Connection ended');
        // Send webhook output file
        if(enableWebhook == true) {
            webhook(config.webhook);
        }
    });
    imap.connect();

}

module.exports = (user, password, host, port, tls, id, enableWebhook) => mail(user, password, host, port, tls, id, enableWebhook);