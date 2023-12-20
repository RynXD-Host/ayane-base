import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { platform } from 'os'
import path from 'path'
import chalk from 'chalk'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('Connecting . . . .')

async function start() {
  let isRunning = false
  let args = [path.join(__dirname, '/lib/main.js'), ...process.argv.slice(2)]
  console.log([process.argv[0], ...args].join('\n'))
  let p = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  })
  .on('message', data => {
    switch (data) {
      case "reset": {
        platform() === "win32" ? p.kill("SIGINT") : p.kill();
        isRunning = false;
        start.apply(this, arguments);
        console.log("[System] Restarting bot...");
      };
      break;
      case "uptime": {
        p.send(process.uptime());
      };
      break;
    }; 
  })
  .on('exit', code => {
    console.error('Exited with code:', code)
    if (code == '.' || code == 1 || code == 0) start()
  })
}
start()