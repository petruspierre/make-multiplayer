import { OverlayStatus } from "@/components/overlay"

export type ChromeMessage = {
  type: keyof typeof chromeMessages;
  payload: any;
}

export const chromeMessages = {
  STATUS_CONNECTED: 'chrome:status:connected',
  STATUS_CONNECTING: 'chrome:status:connecting',
  STATUS_DISCONNECTED: 'chrome:status:disconnected',
  STATUS_ERROR: 'chrome:status:error',
  STATUS_CHANGE: 'chrome:status:change',
}

export const updateStatus = (status: OverlayStatus) => {
  chrome.runtime.sendMessage({
    type: chromeMessages.STATUS_CHANGE,
    payload: {
      status
    },
  })
}