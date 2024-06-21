import { OverlayStatus } from "@/components/overlay"
import PartySocket from "partysocket";

export type ChromeMessage = {
  type: keyof typeof chromeMessages;
  payload: any;
}

export const chromeMessages = {
  STATUS_CHANGE: 'chrome:status:change',
  FETCH_SESSION: 'chrome:session:fetch',
  JOIN_SESSION: 'chrome:session:join',
  CREATE_SESSION: 'chrome:session:create',
  CONNECTED_TO_SESSION: 'chrome:session:connected',
  ADD_LISTENER: 'chrome:listener:add',
}

export const updateStatus = (status: OverlayStatus) => {
  chrome.runtime.sendMessage({
    type: chromeMessages.STATUS_CHANGE,
    payload: {
      status
    },
  })
}
