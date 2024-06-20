console.log('Background script running')

chrome.runtime.onMessage.addListener((message) => {
  console.log('Message received:', message)
})