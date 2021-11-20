// require('dotenv').config();
const fs = require("fs")
const qrcode = require('qrcode-terminal');
const { Client, MessageTypes, MessageMedia, } = require('whatsapp-web.js');

const log = data => console.log("Pic2Stick: "+data)
const error = data => console.error("Pic2Stick: "+data)
const info = data => console.info("Pic2Stick: "+data)
const assert = (condition, data) => console.assert(condition, "Pic2Stick: "+data)

let sessionCfg = JSON.parse(process.env.WW_SESSION || null);
assert(sessionCfg, "Scan Next QR")

const client = new Client({
    puppeteer: {
	    executablePath: "/app/.apt/usr/bin/google-chrome",
        args: [ '--no-sandbox', ],
    },
    session: sessionCfg
});

client.initialize()

client.on('qr', qr =>
	qrcode.generate(qr, {small: true}));

client.on('authenticated', session => {
	info('AUTHENTICATED');
	assert(process.env.WW_SESSION, "WW_SESSION="+JSON.stringify(session))
	sessionCfg=session;
});

client.on('auth_failure', err =>
	error('AUTHENTICATION FAILURE'+err) );

client.on('ready', _ =>
	info('READY') );

client.on('disconnected', reason =>
	info("LOG OUT "+reason));

client.on('message', async msg => {
	if (msg.from !== "status@broadcast")
		if (msg.body.toLocaleLowerCase() === 'help' || msg.body.toLocaleLowerCase() === 'ayuda')
			await msg.reply('Manda una imagen o un video a esta conversación. \nSi deseas añadirle un titulo, solo tienes que agregarle un texto junto a la imagen/~video~ al enviarlo. \n\n_Cualquier problema presentado informalo al +525610338516_')
		else if (msg.hasMedia) {
			let mediaRes = undefined;
			let options = { sendMediaAsSticker: true, stickerAuthor: "pic2sticker @m1ndblast"}
			if (msg.type === MessageTypes.STICKER) {
				mediaRes = new MessageMedia("image/webp", fs.readFileSync("stickers/sentsticker.webp", {encoding: "base64"}),"don't send stickers")
				options.stickerName = mediaRes.filename
				options.stickerCategories = ["😭"]
			}
			else if (msg.type === MessageTypes.IMAGE) {
				mediaRes = await msg.downloadMedia()
				options.stickerName = mediaRes.filename?mediaRes.filename:msg.body
				options.stickerCategories = ["🤣"]
			}
			else {
				mediaRes = new MessageMedia("image/webp", fs.readFileSync("stickers/sentvideo.webp", {encoding: "base64"}),"unsupportable media")
				options.stickerName = mediaRes.filename
				options.stickerCategories = ["😭"]
			}
			if (mediaRes)
				await msg.reply(mediaRes, null, options)
			else
				msg.reply("Huno un problema en la conversión de la imagen.\nMandar una captura de pantalla a https://wa.me/5215610338516 \n\n~No es un link externo, unicamente abre el chat dentro WhatsApp~")
		}
})