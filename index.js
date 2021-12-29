require('dotenv').config();
const APP_NAME = process.env.WAWEB_SESSIONID

const logger = require("log4js")
	.configure({
		appenders: { PIC2STICKER: { type: "stdout" } },
		categories: { default: { appenders: [APP_NAME], level: "debug" } }
	})
	.getLogger(APP_NAME);

const fs = require("fs")
const qrcode = require('qrcode-terminal');
const { Client, MessageTypes, MessageMedia} = require('whatsapp-web.js');

if (!(fs.existsSync("./WWebJS") && fs.existsSync("./WWebJS/session-"+APP_NAME)) )
	logger.warn("Scan Next QR codes")

const client = new Client({ clientId: APP_NAME });

(async _ => {
	await client.initialize();
})();

client.on('qr', (qr) => {
	qrcode.generate(qr, {small: true});
});

client.on('authenticated', _ => {
	logger.info('AUTHENTICATED');
});

// Fired if session restore was unsuccessful
client.on('auth_failure', (err) => {
	logger.error('AUTHENTICATION FAILURE', err);
});

client.on('ready', _ => {
	logger.info('READY');
	client.getChats().then((chats) =>
		chats.filter((chat) => chat.unreadCount > 0 )
			.forEach((chat) =>
				chat.fetchMessages({limit: chat.unreadCount})
					.then((messages) => messages.forEach(pic2sticker))
			)
	)
});

client.on('disconnected', (reason) => {
	logger.fatal('DISCONNECTED', reason);
});

client.on('message', async (msg) => {
	logger.trace('MESSAGE RECEIVED', msg);
	pic2sticker(msg)
});

/**
 * @param msg {Message}
 * @returns {void}
 */
async function pic2sticker(msg) {
	logger.debug("pic2sticker()", msg.from, "=>", msg.body)
	msg.getChat()
		.then((chat) => chat.sendSeen())
		.then( async _ => {
			if (!msg.isStatus)
				if (msg.body.toLocaleLowerCase() === 'help' || msg.body.toLocaleLowerCase() === 'ayuda')
					await msg.reply('Manda una imagen o un video a esta conversación. \n\nSi deseas añadirle un titulo, solo tienes que agregarle un texto adjunto al enviarlo. \n\n_Cualquier problema presentado informalo al +525610338516_')
				else if (msg.hasMedia) {
					let mediaRes,
						options = { sendMediaAsSticker: true, stickerAuthor: "pic2sticker @m1ndblast"}
					switch (msg.type) {
						case MessageTypes.IMAGE:
						case MessageTypes.VIDEO:
							mediaRes = await msg.downloadMedia()
							options.stickerName = mediaRes.filename?mediaRes.filename:msg.body
							options.stickerCategories = ["🤣","🤣"]
							break
						case MessageTypes.STICKER:
							mediaRes = new MessageMedia("image/webp", fs.readFileSync("stickers/sentsticker.webp", {encoding: "base64"}),"don't send stickers")
							options.stickerName = mediaRes.filename
							options.stickerCategories = ["😭", "😭"]
							break
						default:
							mediaRes = new MessageMedia("image/webp", fs.readFileSync("stickers/sentvideo.webp", {encoding: "base64"}),"unsupportable media")
							options.stickerName = mediaRes.filename
							options.stickerCategories = ["😭","😭"]
							break
					}
					if (mediaRes)
						await msg.reply(mediaRes, null, options)
					else
						await msg.reply("Huno un problema en la conversión de la imagen.\nMandar una captura de pantalla a https://wa.me/5215610338516 \n\n~No es un link externo, unicamente abre el chat dentro WhatsApp~")
				}
		})
}