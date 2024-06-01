import { socket } from "../../socket/client"

chrome.runtime.onMessage.addListener((request) => {
  socket.send('hello from background')
})
