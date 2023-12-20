import FauziConnect, {
  useMultiFileAuthState,
  makeInMemoryStore,
  PHONENUMBER_MCC,
  makeCacheableSignalKeyStore,
  jidNormalizedUser  
} from '@whiskeysockets/baileys';

import readline from 'readline';
import pino from 'pino'
import fs from 'fs'
import chalk from 'chalk'
import connectionUpdate from './events/connectionUpdate.js'
import groupUpdate from './events/groupUpdate.js'
import Serialize from './utils/serialize.js'
import FauzidevMsg from './messages/ayane.js'
import dc from './database/index.js'

const phoneNumber = dc.config.pairingNumber
const pairingCode = !!phoneNumber || process.argv.includes("--code");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve)); 
const store = makeInMemoryStore(pino({ level: "silent", stream: "store" }).child({ level: "silent" }));

if(!pairingCode) throw "Use node index --code"
async function WAConnection() {
  await(await import("./utils/database.js")).default()
  const { state, saveCreds } = await useMultiFileAuthState('./lib/database/session')
  const conn = FauziConnect.default({
    logger: pino({ level: "silent" }),
    printQRInTerminal: !pairingCode,
    browser: ['Chrome (Linux)', '', ''],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })), 
    }
  });
  
  store.bind(conn.ev)
  
  if(pairingCode && !conn.authState.creds.registered) {
    if(!!phoneNumber) {
        if(!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
        console.log(chalk.bgBlack(chalk.redBright(`Start with country code of your WhatsApp Number, example: +628xxxx`)));
        process.exit(0);
      };
    } else {
      phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number \nFor example: +628xxxx : `)));
      phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
      if(!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
        console.log(chalk.bgBlack(chalk.redBright(`Start with country code of your WhatsApp Number, example: +628xxxx`)));
        phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number \nFor example: +628xxxx : `)));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        rl.close();
      };
    }
    setTimeout(async () => {
    let code = await conn.requestPairingCode(phoneNumber);
      code = code?.match(/.{1,4}/g)?.join("-") || code;
      console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)));
    }, 3000);
  }
  
  conn.ev.process(async (events) => {
    if(events['messages.upsert']) {
      const chatUpdate = events['messages.upsert']
      if (global.db.data) await global.db.write() 
      if (!chatUpdate.messages) return;
      let m = chatUpdate.messages[0] || chatUpdate.messages[chatUpdate.messages.length - 1]
      if (!m.message) return
      if (m.key.id.startsWith('BAE5') && m.key.id.length === 16) return
      m = await Serialize(conn, m, store) 
      FauzidevMsg(conn, m, chatUpdate,store)
    }
    if(events["creds.update"]) {
      await saveCreds()
    }
    if(events["connection.update"]) {
      const update = events["connection.update"];
      const { connection } = update;
      new connectionUpdate(update, WAConnection)
    }
    if(events['group-participants.update']) {
      const anu = events['group-participants.update']
      if (global.db.data == null) await loadDatabase()
      console.log(anu)
      const f = new groupUpdate(conn, anu)
      f.run()
    }
  }) 
}
WAConnection()