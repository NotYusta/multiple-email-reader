const config = require('../.config.js');
const mail = require('./structures/Mail.js');

const emails = config.email.users;
for(x in emails) {
    const email = emails[x];
    mail(email.user, email.password, email.host, email.port, email.tls, email.id, true);
}