// require('dotenv').config();

const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

let sessionLocal = JSON.parse(process.env.WW_SESSION || null);
console.log(sessionLocal? "read wwhatsapp-session!" : "scan next code...");

const client = new Client({
    puppeteer: {
        args: [
            '--no-sandbox',
        ],
    },
    session: sessionLocal
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('authenticated', session => {
    // Save this session object in WW_SESSION manually to reuse it next time
    if (!process.env.WW_SESSION)
        console.log("WW_SESSION <-"+JSON.stringify(session));
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (message) => {
    console.log(message);
    const check = message.body.toLowerCase();
    if (check.indexOf('!hi') !== -1 || check.indexOf('!hello') !== -1) {
        message.reply('Hello there!\nI am ww-bot. This is an automated message.\nRead more at https://github.com/ameybhavsar24/ww-bot');
    }
    console.log(await client.getWWebVersion())
});

client.initialize()

