define(["underscore","jquery","../i18n","../time","../user","../socket","../core/Model","../data/colorFactory","./dictionaries","app/core/templates/userInfo"],function(e,t,a,s,i,n,r,o,l,d){"use strict";var c={pending:"danger",started:"info",analyzing:"warning",finished:"success"},u={image:"fa-file-image-o",text:"fa-file-text-o",audio:"fa-audio-o",video:"fa-video-o","application/octet-stream":"fa-file-archive-o","application/x-zip-compressed":"fa-file-archive-o","application/x-7z-compressed":"fa-file-archive-o","application/x-rar-compressed":"fa-file-archive-o","application/pdf":"fa-file-pdf-o","application/json":"fa-file-code-o","application/msword":"fa-file-word-o","application/vnd.openxmlformats-officedocument.wordprocessingml.document":"fa-file-word-o","application/vnd.ms-excel":"fa-file-excel-o","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"fa-file-excel-o","application/vnd.ms-powerpoint":"fa-file-powerpoint-o","application/vnd.openxmlformats-officedocument.presentationml.presentation":"fa-file-powerpoint-o"};return o.setColors("fap/users",["#0af","#5cb85c","#fa0","#a0f","#f0a","#f00","#ff0","#9ff"]),r.extend({urlRoot:"/fap/entries",clientUrlRoot:"#fap/entries",topicPrefix:"fap.entries",privilegePrefix:"FAP",nlsDomain:"wmes-fap-entries",labelAttribute:"rid",initialize:function(){this.serialized=null,this.on("sync change",function(){this.serialized=null})},isObserver:function(){return e.some(this.get("observers"),function(e){return e.user.id===i.data._id})},serialize:function(){if(this.serialized)return this.serialized;var e=this.toJSON();e.createdAt=s.format(e.createdAt,"L HH:mm");var t=l.categories.get(e.category);return t&&(e.category=t.getLabel()),e.divisions=e.divisions.join("; "),e.lines=e.lines.join("; "),e.assessment=a(this.nlsDomain,"assessment:"+e.assessment),e.analyzing="pending"!==e.status&&e.analysisNeed&&!e.analysisDone,e.analysisDone=e.analysisNeed?a("core","BOOL:"+e.analysisDone):"-",e.analysisNeed=a("core","BOOL:"+e.analysisNeed),e.orderNo||(e.orderNo="-",e.nc12="-",e.productName="-",e.mrp="-",e.qtyTodo="-",e.qtyDone="-"),e.lines||(e.lines="-",e.divisions="-"),this.serialized=e},serializeRow:function(){if(this.serialized)return this.serialized;var t=this.serialize();return t.className=c[t.analyzing?"analyzing":t.status],t.category='<span class="fap-list-category">'+e.escape(t.category)+"</span>",t.problem='<span class="fap-list-problem">'+e.escape(t.problem)+"</span>",this.serialized=t},serializeDetails:function(){if(this.serialized)return this.serialized;var e=this.serialize();switch(e.auth=this.serializeAuth(),e.problem=e.problem.trim().replace(/\n{3,}/,"\n\n"),e.solution=e.solution.trim().replace(/\n{3,}/,"\n\n")||"-",e.solutionSteps=e.solutionSteps.trim().replace(/\n{3,}/,"\n\n")||"-",e.multiline={problem:-1!==e.problem.indexOf("\n"),solution:-1!==e.solution.indexOf("\n"),solutionSteps:-1!==e.solutionSteps.indexOf("\n")},e.chat=this.serializeChat(),e.attachments=e.attachments.map(this.serializeAttachment,this),e.observers=this.serializeObservers(),e.message={type:"",text:""},e.status){case"pending":e.message.type="error",e.message.text=a(this.nlsDomain,"message:pending");break;case"started":e.message.type=e.analyzing?"warning":"info",e.message.text=a(this.nlsDomain,"message:started:"+e.analyzing);break;case"finished":e.message.type=e.analyzing?"warning":"success",e.message.text=a(this.nlsDomain,"message:finished:"+e.analyzing)}return this.serialized=e},serializeAuth:function(){var t=i.isAllowedTo("FAP:MANAGE"),a=i.isAllowedTo("FN:process-engineer"),s=i.isAllowedTo("FN:master"),n=i.isAllowedTo("FN:leader"),r=e.some(this.get("analyzers"),function(e){return i.data._id===e.id}),o=this.get("status"),l="pending"===o,d="started"===o,c=this.get("analysisNeed"),u=this.get("analysisDone");return{delete:this.canDelete(),restart:t,status:t||a||s||n,solution:t||a||s||n,problem:d&&(t||a||s||n),category:d&&(t||a),orderNo:d&&(t||a),lines:d&&(t||a),assessment:!l&&(t||a||s),analysisNeed:!l&&(t||a||s),analysisDone:!l&&c&&(t||a||s),analysers:!l&&c&&!u&&(t||a||s),why5:!l&&c&&!u&&(t||a||s||n||r),solutionSteps:!l&&c&&!u&&(t||a||s||n||r)}},serializeChat:function(){var e=this,t={};e.attributes.attachments.forEach(function(e){t[e._id]=!0});var n=e.get("createdAt"),r=s.getMoment(n),l=e.get("owner"),c=l.id===i.data._id,u=[{user:{id:l.id,label:d({userInfo:l}),self:c},color:c?"transparent":o.getColor("fap/users",l.id),lines:[{time:r.format("LLLL"),text:a(e.nlsDomain,"history:added",{day:r.day(),ddd:r.format("ddd"),date:r.format("D MMMM YYYY"),time:r.format("HH:mm:ss")})}]}];return e.get("changes").forEach(function(a){if(a.user){var s=!!a.comment,i=!!a.data.attachments&&!a.data.attachments[0]&&!!a.data.attachments[1],n=!!a.data.status;(s||i||n)&&e.serializeChatMessage(a,u,t)}}),u},serializeChatMessage:function(t,n,r){var l=this,c=n&&n[n.length-1],u=s.format(t.date,"dddd, LL LTS"),f=[];t.comment&&f.push({time:u,text:e.escape(t.comment)}),t.data.status&&f.push({time:u,text:a(this.nlsDomain,"chat:status:"+t.data.status.join(":"))});var h=t.data.attachments;if(h&&!h[0]&&h[1]&&t.data.attachments[1].forEach(function(t){if(!r||r[t._id]){var a=l.serializeAttachment(t);f.push({time:u,text:'<span class="fap-chat-attachment" data-attachment-id="'+t._id+'"><i class="fa '+a.icon+'"></i><a>'+e.escape(a.label)+"</a></span>"})}}),c&&c.user.id===t.user.id)return c.lines.push.apply(c.lines,f),c;var p=t.user.id===i.data._id,m={user:{id:t.user.id,label:d({userInfo:t.user}),self:p},color:p?"transparent":o.getColor("fap/users",t.user.id),lines:f};return n&&n.push(m),m},serializeObservers:function(){var e=this;return e.get("observers").map(function(t){var a=t.user.id===i.data._id;return{_id:t.user.id,label:d({userInfo:t.user,noIp:!0}),color:a?"#000":o.getColor("fap/users",t.user.id),lastSeenAt:t.lastSeenAt?Date.parse(t.lastSeenAt):0,online:a||!!e.attributes.presence[t.user.id]}}).sort(function(e,t){return t.lastSeenAt-e.lastSeenAt})},serializeAttachment:function(e){var t=e.type.split("/")[0];return{_id:e._id,icon:u[e.type]||u[t]||"fa-file-o",preview:"image"===t,label:e.name,menu:i.isAllowedTo("FAP:MANAGE","FN:master","FN:leader","FN:process-engineer")||e.user&&e.user.id===i.data._id}},canDelete:function(){return i.isAllowedTo(this.privilegePrefix+":MANAGE")},change:function(e,t,a){void 0===a&&(a=this.get(e));var s={date:new Date,user:i.getInfo(),data:{},comment:""},n={};s.data[e]=[a,t],n[e]=t,this.handleChange(s),this.update(n)},multiChange:function(e,t){var a=this,s={date:new Date,user:i.getInfo(),data:{},comment:""},n={};Object.keys(e).forEach(function(i){var r,o;t?(r=e[i][0],o=e[i][1]):(r=a.get(i),o=e[i]),JSON.stringify(o)!==JSON.stringify(r)&&(s.data[i]=[r,o],n[i]=o)}),Object.keys(n).length&&(a.handleChange(s),a.update(n))},update:function(e){var a=this,s=t.ajax({method:"PATCH",url:"/fap/entries/"+a.id,data:JSON.stringify({socketId:n.getId(),data:e})});return s.fail(function(){a.fetch()}),s},handlePresence:function(e,t){var a=this.attributes.presence;void 0===a[e]&&(a[e]=!1),a[e]!==t&&(a[e]=t,this.trigger("change:presence",this,a,{userId:e,online:t}),this.serialized&&(this.serialized.observers=this.serializeObservers()))},handleChange:function(e){var t=this,a={changes:t.get("changes").concat(e)};Object.keys(e.data).forEach(function(s){var i=t.propChangeHandlers[s];1===i?a[s]=e.data[s][1]:i&&i.call(t.propChangeHandlers,a,t,e.data[s],e)}),t.set(a)},propChangeHandlers:{subscribers:function(e,t,a){var s=t.get("observers");null===a[0]?this.addObservers(e,t,s,a[1]):null===a[1]&&this.removeObservers(e,t,s,a[0])},addObservers:function(e,t,a,s){var i={};a.forEach(function(e){i[e.user.id]=!0});var n=[].concat(a);s.forEach(function(e){i[e.id]||(n.push({user:e}),i[e.id]=!0)}),e.observers=n},removeObservers:function(e,t,a,s){var i={};s.forEach(function(e){i[e.id]=!0}),e.observers=a.filter(function(e){return!i[e.user.id]})},attachments:function(e,t,a){var s=t.get("attachments");null===a[0]?this.addAttachments(e,t,s,a[1]):null===a[1]?this.removeAttachments(e,t,s,a[0]):this.editAttachments(e,t,s,a[1])},addAttachments:function(e,t,a,s){var i={};a.forEach(function(e){i[e._id]=!0});var n=[].concat(a);s.forEach(function(e){i[e._id]||(n.push(e),i[e.id]=!0)}),e.attachments=n},removeAttachments:function(e,t,a,s){var i={};s.forEach(function(e){i[e._id]=!0}),e.attachments=a.filter(function(e){return!i[e._id]})},editAttachments:function(e,t,a,s){var i={};s.forEach(function(e){i[e._id]=e}),e.attachments=a.map(function(e){return i[e._id]||e})},status:1,problem:1,solution:1,category:1,divisions:1,lines:1,why5:1,solutionSteps:1,assessment:1,analysisNeed:1,analysisDone:1,orderNo:1,mrp:1,nc12:1,productName:1,qtyTodo:1,qtyDone:1}},{AUTH_PROPS:{status:!0,analysisNeed:!0,analysisDone:!0,analyzers:!0}})});