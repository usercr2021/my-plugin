import browser from "webextension-polyfill";


console.log("Hello from the background!");

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
});



// interface MessageSender {
//   documentId: string
//   documentLifecycle: string
//   frameId: string
//   id: string
//   tabId: number
// }

// // 暴露接口给 popup / content script
// chrome.runtime.onMessage.addListener((msg: any, sender: MessageSender, sendResponse: Function) => {
//   if (msg.type === 'init-db') {
//     initDuckDB().then(() => sendResponse({ ok: true }));
//     return true;
//   }

//   if (msg.type === 'query') {
//     (async () => {
//       const db = await initDuckDB();
//       const conn = await db?.connect();
//       const result = await conn?.query(msg.sql);
//       sendResponse({ result: result?.toArray() });
//     })();
//     return true; // 异步响应
//   }
// });