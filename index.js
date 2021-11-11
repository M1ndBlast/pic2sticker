// require('dotenv').config();

const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const client = new Client({ puppeteer: {headless: true} });
client.initialize();

client.on('qr', qr => { qrcode.generate(qr, { small: true }) })

client.on('auth_failure', msg => {
	console.error("auth_failure", msg)
})

// Save session values to the file upon successful auth
client.on('authenticated', () => {
	console.log("authenticated")
})

client.on('ready', () => {
	console.log('ready')
})

client.on('disconnected', (reason) => {
	console.info('disconnected', reason);
});

client.on('message', async msg => {
	if (msg.body.toLocaleLowerCase() === 'help' || msg.body.toLocaleLowerCase() === 'ayuda')
		await msg.reply('Manda una imagen o un video a esta conversación. \nSi deseas añadirle un titulo, solo tienes que agregarle un texto junto a la imagen/~video~ al enviarlo. \n\n_Cualquier problema presentado informalo al +525610338516_')

	if (msg.hasMedia) {
		let media = await msg.downloadMedia()
		console.log(`message received: ${msg}`)
		await msg.reply(media, undefined, { sendMediaAsSticker: true, stickerAuthor: "pic2sticker @m1ndblast", stickerName: media.filename!==undefined?media.filename:msg.body, stickerCategories: ["love"]})
	}
})
//https://buildpack-registry.s3.amazonaws.com/buildpacks/jontewks/puppeteer.tgz