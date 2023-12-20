export default class memberUpdate {
  constructor(conn, anu) {
    this.conn = conn;
    this.anu = anu;
  }
  async run() {
    this.metadata = await this.conn.groupMetadata(this.anu.id);
    this.participants = this.anu.participants
    const { action } = this.anu
    for (const num of this.participants) {
      switch (action) {
        case 'add': {
          this.conn.sendMessage(this.anu.id, { text: `Hi @${num.split("@")[0]} Welcome To ${this.metadata.subject}`, mentions: [num]})
        }
        break
        case 'remove': {
          this.conn.sendMessage(this.anu.id, { text: `Goodbye @${num.split("@")[0]} I hope you don't come back`, mentions: [num]})
        } 
        break 
        case 'promote': {
          this.conn.sendMessage(this.anu.id, { text: `@${num.split("@")[0]} Congratulations, Now you are a Group Admin`, mentions: [num]})
        }
        break
        case 'demote': {
          this.conn.sendMessage(this.anu.id, { text: `@${num.split("@")[0]} Hahaha You are in demote`, mentions: [num]})
        }
        break
      }
    }
  }
}
