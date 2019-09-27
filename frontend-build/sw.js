const messageHandlers={},notificationActions={};let errorCount=0;function showError(t){t.tag="error-"+ ++errorCount,self.registration.showNotification("WMES Error",t),setTimeout(()=>{self.registration.getNotifications().then(e=>{const n=e.find(e=>e.tag===t.tag);n&&n.close()})},1e4)}function focusOrOpen(t){return self.clients.matchAll({type:"window"}).then(e=>e.find(e=>e.url.includes(t))).then(e=>e?e.focus():self.clients.openWindow(t))}function inspect(t){self.fetch("/dev/inspect",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",redirect:"manual",body:JSON.stringify(t)})}self.addEventListener("install",t=>{t.waitUntil(self.skipWaiting())}),self.addEventListener("activate",t=>{t.waitUntil(self.clients.claim())}),self.addEventListener("message",t=>{const e={error:null,result:null};messageHandlers[t.data.action]?messageHandlers[t.data.action](t,(n,i)=>{e.error=n,e.result=i,t.ports.forEach(t=>t.postMessage(e))}):(e.error=new Error("Unknown action: "+t.data.action),t.ports.forEach(t=>t.postMessage(e)))}),self.addEventListener("notificationclick",t=>{const e=t.notification,n=e.data||{},i=n.onAction&&n.onAction[t.action]||n.onClick||{};!1!==i.close&&e.close();const o=[];i.open?o.push(focusOrOpen(i.open)):i.focus&&o.push(self.clients.get("string"==typeof i.focus?i.focus:n.bestClientId).then(t=>t.focus())),i.notify&&("object"!=typeof i.notify&&(i.notify={}),o.push(self.clients.get(i.notify.clientId||n.bestClientId).then(e=>e.postMessage({action:"notifications.userAction",userAction:i.notify.userAction||t.action,notificationAction:t.action,notificationReply:t.reply,data:i.notify.data||{}})))),i.act&&notificationActions[i.act.action]&&o.push(notificationActions[i.act.action](t,i.act.data||{})),t.waitUntil(Promise.all(o))}),self.addEventListener("notificationclose",t=>{t.waitUntil(self.skipWaiting())}),messageHandlers.getClientId=((t,e)=>{e(null,{clientId:t.source.id})}),messageHandlers.getClients=((t,e)=>{self.clients.matchAll(t.data&&t.data.filter||{type:"window"}).then(t=>{e(null,t.map(t=>({_id:t.id,type:t.type,url:t.url,focused:!0===t.focused,visibilityState:t.visibilityState||"undetermined"})))}).catch(e)}),notificationActions.wmesFapComment=((t,e)=>{if(!e.entryId)return Promise.resolve();const n=(t.reply||"").trim();if(!n.replace(/[^a-zA-Z0-9]+/g,"").length)return Promise.resolve();const i={method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"same-origin",redirect:"manual",body:JSON.stringify({data:{comment:n}})};return self.fetch("/fap/entries/"+e.entryId,i).then(t=>{if(204!==t.status)throw new Error(`Unexpected response status: ${t.status}`);return focusOrOpen("/#fap/entries/"+e.entryId)}).catch(t=>showError({body:`Failed to comment FAP entry: ${e.entryId}.\n\nReason: ${t&&t.message||t}`,data:{onClick:{open:"/#fap/entries/"+e.entryId}}}))});