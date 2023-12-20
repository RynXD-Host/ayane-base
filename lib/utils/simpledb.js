import fs from 'fs'
import dc from '../database/index.js'

export default class simpledb {
  constructor(m, isCmd, isCreator) {
    this.m = m;
    this.isCmd = isCmd;
    this.isCreator = isCreator;
    this.user = global.db.data.users[this.m.sender]
    this.limitUser = isCreator ? 'Infinity' : 15;
    if(this.isCmd || this.isCreator) {
      if(this.user) {
        if(!('Name' in this.user)) this.user.name = this.m.pushName
        if (!isNumber(this.user.limit)) this.user.limit = this.limitUser
      } else {
        global.db.data.users[this.m.sender] = {
          name: this.m.pushName,
          limit: this.limitUser
        }
      }
    }
  }
}
