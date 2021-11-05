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

client.on('qr', qr => { qrcode.generate(qr, { small: true }) })

client.on('auth_failure', msg => {
	console.error("Hubo un fallo en la autentificacion", msg)
	fs.unlink(SESSION_PATH, err => {
		if (err)
			console.error("Hubo un problema al restableer la sesión",err)
		else
			console.info("Sesión restablecida. Vuelva a ejecutar el programa")
	})
})

// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
	// Save this session object in WW_SESSION manually to reuse it next time
	if (!process.env.WW_SESSION)
		console.log("WW_SESSION <-"+JSON.stringify(session));
})

client.on('ready', () => {
	console.log('Client is ready!')
})

client.on('message', async msg => {
	if (msg.body.toLocaleLowerCase() === 'help' || msg.body.toLocaleLowerCase() === 'ayuda')
		await msg.reply('Manda una imagen o un video a esta conversación. \nSi deseas añadirle un titulo, solo tienes que agregarle un texto junto a la imagen/~video~ al enviarlo. \n\n_Cualquier problema presentado informalo al +525610338516_')

	if (msg.hasMedia) {
		let media = await msg.downloadMedia()
		console.log(`message received: ${msg}`)
		await msg.reply(media, undefined, { sendMediaAsSticker: true, stickerAuthor: "pic2sticker @m1ndblast", stickerName: media.filename!==undefined?media.filename:msg.body, stickerCategories: ["love"]})
	}
})

client.initialize()

//https://buildpack-registry.s3.amazonaws.com/buildpacks/jontewks/puppeteer.tgz