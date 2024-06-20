import { OverlayStatus } from "@/components/overlay"

export type ChromeMessage = {
  type: keyof typeof chromeMessages;
  payload: any;
}

export const chromeMessages = {
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