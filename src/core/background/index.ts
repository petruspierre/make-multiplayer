import PartySocket from "partysocket"
import { ChromeMessage, chromeMessages, connectedToSession } from "../chromeMessages"
import { getSocketForSession } from "@/socket/client"

console.log('Background script running')
let socket: PartySocket | null = null
let listeners: Map<string, (message: any) => void> = new Map()

chrome.runtime.onMessage.addListener((message: ChromeMessage) => {
  switch (message.type) { 
    default:
      console.log('Unknown message type', message)
  }
})