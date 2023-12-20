export default class connection {
  constructor(update, WAConnection) {
    this.up = update;
    this.WAConnection = WAConnection;
    const { connection } = this.up
    switch (connection) {
      case 'close': {
        console.info(`Connection info: Reconnecting . . .`);
        this.WAConnection();
      }
      break
      case 'open': {
        console.warn(`Connection info: Connected . . .`);
      }
      break 
    }
  }
}