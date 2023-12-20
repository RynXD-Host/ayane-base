import fs from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const dirr = join(dirname(fileURLToPath(import.meta.url)), "config")
const dbName = "json"
const file = {
  config: join(dirr, "config." + dbName)
}
fs.accessSync(file.config);
const set = {
  config: JSON.parse(fs.readFileSync(file.config))
}
export default set

setInterval(async() => {
  fs.writeFileSync(file.config, JSON.stringify(set.config, null, 2));
}, 990);