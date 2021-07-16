const Imap = require('imap');
const inspect = require('util').inspect;
function setup(user, password, host, port, tls) {
    const imap = new Imap({
        user: user,
        password: password,
        host: host,
        port: port,
        tls: tls
    });
    async function openInbox(callback) {
        await imap.openBox('Inbox', false, callback);
    }
    console.log('---------------------');
    imap.once('ready', () => {
        openInbox((err, box) => {
            if (err) throw err;
            const f = imap.seq.fetch(box.messages.total, {
                bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                struct: true,
                markSeen: true
            });
            f.on('message', (msg, seqno) => {
                let prefix = '(#' + seqno + ') ';
                let unread = false;
                msg.on('body', (stream, info) => {
                    let buffer = '';
                    stream.on('data', (chunk) => {
                        buffer += chunk.toString('utf8');
                    });
                    stream.once('end', () => {
                        if(unread == true) {
                            console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
                        }
                    });
                    msg.once('attributes', (attrs) => {
                        if(attrs.flags != 'SEEN') {
                            console.log(prefix + 'already readed');
                            unread = true;
                        } else {
                            console.log(prefix + 'is unread');
                            unread = true; 
                        }
                    });
                });
            });
            f.once('error', (err) => {
                console.log('Fetch error: ' + err);
            });
            f.once('end', () => {
                console.log('Done fetching all messages!');
                imap.end();
            });
        });
    });
    imap.once('error', (err) => {
        console.log(err);
    });
       
    imap.once('end', () => {
        console.log('Connection ended');
        console.log('---------------------');
    });

    imap.connect();
}


module.exports = (user, password, host, port, tls) => setup(user, password, host, port, tls);