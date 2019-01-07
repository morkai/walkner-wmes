define(["underscore","jquery","autolinker","../i18n","../time","../user","../socket","../core/Model","../data/colorFactory","./dictionaries","app/core/templates/userInfo"],function(e,t,a,s,i,n,r,o,l,d,c){"use strict";var u={pending:"danger",started:"info",analyzing:"warning",finished:"success"},h={image:"fa-file-image-o",text:"fa-file-text-o",audio:"fa-audio-o",video:"fa-video-o","application/octet-stream":"fa-file-archive-o","application/x-zip-compressed":"fa-file-archive-o","application/x-7z-compressed":"fa-file-archive-o","application/x-rar-compressed":"fa-file-archive-o","application/pdf":"fa-file-pdf-o","application/json":"fa-file-code-o","application/msword":"fa-file-word-o","application/vnd.openxmlformats-officedocument.wordprocessingml.document":"fa-file-word-o","application/vnd.ms-excel":"fa-file-excel-o","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"fa-file-excel-o","application/vnd.ms-powerpoint":"fa-file-powerpoint-o","application/vnd.openxmlformats-officedocument.presentationml.presentation":"fa-file-powerpoint-o"};l.setColors("fap/users",["#0af","#5cb85c","#fa0","#a0f","#f0a","#f00","#ff0","#9ff"]);var f=null;return o.extend({urlRoot:"/fap/entries",clientUrlRoot:"#fap/entries",topicPrefix:"fap.entries",privilegePrefix:"FAP",nlsDomain:"wmes-fap-entries",labelAttribute:"rid",initialize:function(){this.serialized=null,this.on("change",function(){this.serialized=null})},isObserver:function(){return e.some(this.get("observers"),function(e){return e.user.id===n.data._id})},serialize:function(){if(this.serialized)return this.serialized;var e=this.toJSON();e.createdAt=i.format(e.createdAt,"L HH:mm");var t=d.categories.get(e.category);return t&&(e.category=t.getLabel()),e.divisions=e.divisions.join("; "),e.lines=e.lines.join("; "),e.assessment=s(this.nlsDomain,"assessment:"+e.assessment),e.analyzing="pending"!==e.status&&e.analysisNeed&&!e.analysisDone,e.analysisDone=e.analysisNeed?s("core","BOOL:"+e.analysisDone):"-",e.analysisNeed=s("core","BOOL:"+e.analysisNeed),e.orderNo||(e.orderNo="-",e.nc12="-",e.productName="-",e.mrp="-",e.qtyTodo="-",e.qtyDone="-"),e.lines||(e.lines="-",e.divisions="-"),this.serialized=e},serializeRow:function(){if(this.serialized)return this.serialized;var t=this.serialize();return t.className=u[t.analyzing?"analyzing":t.status],t.category='<span class="fap-list-category">'+e.escape(t.category)+"</span>",t.problem='<span class="fap-list-problem">'+e.escape(t.problem)+"</span>",this.serialized=t},serializeDetails:function(){if(this.serialized)return this.serialized;var e=this.serialize();switch(e.auth=this.serializeAuth(),e.problem=e.problem.trim().replace(/\n{3,}/,"\n\n"),e.solution=e.solution.trim().replace(/\n{3,}/,"\n\n")||"-",e.solver=e.solver?e.solver.label:"",e.solutionSteps=e.solutionSteps.trim().replace(/\n{3,}/,"\n\n")||"-",e.empty={solution:"-"===e.solution},e.multiline={problem:-1!==e.problem.indexOf("\n"),solution:-1!==e.solution.indexOf("\n"),solutionSteps:-1!==e.solutionSteps.indexOf("\n")},e.mainAnalyzer=e.analyzers.length?e.analyzers[0].label:"-",e.analyzers=e.analyzers.length>1?e.analyzers.slice(1).map(function(e){return e.label}).join("; "):"-",e.chat=this.serializeChat(),e.attachments=e.attachments.map(this.serializeAttachment,this),e.observers=this.serializeObservers(),e.message={type:"",text:""},e.status){case"pending":e.message.type="error",e.message.text=s(this.nlsDomain,"message:pending");break;case"started":e.message.type=e.analyzing?"warning":"info",e.message.text=s(this.nlsDomain,"message:started:"+e.analyzing);break;case"finished":e.message.type=e.analyzing?"warning":"success",e.message.text=s(this.nlsDomain,"message:finished:"+e.analyzing)}return this.serialized=e},serializeAuth:function(){var t=n.isAllowedTo("FAP:MANAGE"),a=n.isLoggedIn(),s=n.isAllowedTo("FN:process-engineer","FN:process-engineer-NPI"),i=n.isAllowedTo("FN:designer","FN:designer_eto"),r=n.isAllowedTo("FN:master"),o=n.isAllowedTo("FN:leader"),l=this.get("analyzers"),d=e.some(l,function(e){return n.data._id===e.id}),c=d&&l[0].id===n.data._id,u=this.get("status"),h="pending"===u,f="started"===u,p=this.get("analysisNeed"),m=this.get("analysisDone"),g=!h&&p&&!m&&(t||s||r);return{delete:this.canDelete(),comment:a,attachments:a,observers:a,restart:t,status:t||s||i||r||o,solution:t||s||i||r||o,problem:f&&(t||s||i||r||o),category:f&&(t||s||i),orderNo:f&&(t||s),lines:f&&(t||s),assessment:!h&&(t||s||r),analysisNeed:!h&&(t||s||r),analysisDone:!h&&p&&(t||s||r),mainAnalyzer:g,analyzers:(l.length||g)&&!h&&p&&!m&&(t||s||r||c),why5:!h&&p&&!m&&(t||s||r||o||d),solutionSteps:!h&&p&&!m&&(t||s||r||o||d)}},serializeChat:function(){var e=this,t={};e.attributes.attachments.forEach(function(e){t[e._id]=!0});var a=e.get("createdAt"),r=i.getMoment(a),o=e.get("owner"),d=o.id===n.data._id,u=[{user:{id:o.id,label:c({userInfo:o,noIp:!0}),self:d},color:d?"transparent":l.getColor("fap/users",o.id),lines:[{time:r.format("LLLL"),text:s(e.nlsDomain,"history:added",{day:r.day(),ddd:r.format("ddd"),date:r.format("D MMMM YYYY"),time:r.format("HH:mm:ss")})}]}];return e.get("changes").forEach(function(a){if(a.user){var s=!!a.comment,i=!!a.data.attachments&&!a.data.attachments[0]&&!!a.data.attachments[1],n=!!a.data.status,r=!!a.data.analysisNeed||!!a.data.analysisDone;(s||i||n||r)&&e.serializeChatMessage(a,u,t)}}),u},serializeChatMessage:function(t,r,o){var d,u,h=this,p=r&&r[r.length-1],m="<time>"+i.format(t.date,"HH:mm:ss")+"</time>",g=i.format(t.date,"dddd, LL LTS"),v=[];t.comment&&v.push({time:g,text:m+(u=e.escape(t.comment),f||(f=new a({urls:{schemeMatches:!0,wwwMatches:!0,tldMatches:!0},email:!0,phone:!1,mention:!1,hashtag:!1,stripPrefix:!0,stripTrailingSlash:!0,newWindow:!0,truncate:{length:0,location:"end"},className:"",replaceFn:function(e){var t=e.getUrl(),a=e.buildTag();if("url"===e.getType()&&-1!==t.indexOf(window.location.host)){var s=a.innerHTML.split("?");s.length>1&&s[1].length&&(a.innerHTML=s[0]+"?&hellip;"),delete a.attrs.rel}else a.innerHTML.length>=60&&(a.innerHTML=a.innerHTML.substring(0,50)+"&hellip;");return a}})),f.link(u))}),t.data.status&&(d="?","finished"===t.data.status[1]&&(d=(d=Date.parse(t.date)-Date.parse(this.get("createdAt")))>0?i.toString(d/1e3):"?"),v.push({time:g,text:s(this.nlsDomain,"chat:status:"+t.data.status.join(":"),{duration:d})})),t.data.analysisNeed&&t.data.analysisNeed[1]&&v.push({time:g,text:s(this.nlsDomain,"chat:analysis:started")}),t.data.analysisDone&&t.data.analysisDone[1]&&(d=(d=Date.parse(t.date)-Date.parse(this.get("analysisStartedAt")))>0?i.toString(d/1e3):"?",v.push({time:g,text:s(this.nlsDomain,"chat:analysis:finished",{duration:d})}));var y=t.data.attachments;if(y&&!y[0]&&y[1]&&t.data.attachments[1].forEach(function(t){if(!o||o[t._id]){var a=h.serializeAttachment(t);v.push({time:g,text:'<span class="fap-chat-attachment" data-attachment-id="'+t._id+'"><i class="fa '+a.icon+'"></i><a>'+e.escape(a.label)+"</a></span>"})}}),p&&p.user.id===t.user.id)return p.lines.push.apply(p.lines,v),p;var z=t.user.id===n.data._id,b={user:{id:t.user.id,label:c({userInfo:t.user,noIp:!0}),self:z},color:z?"transparent":l.getColor("fap/users",t.user.id),lines:v};return r&&b.lines.length&&r.push(b),b},serializeObservers:function(){var e=this;return e.get("observers").map(function(t){var a=t.user.id===n.data._id;return{_id:t.user.id,label:c({userInfo:t.user,noIp:!0}),color:a?"#000":l.getColor("fap/users",t.user.id),lastSeenAt:t.lastSeenAt?Date.parse(t.lastSeenAt):0,online:a||!!e.attributes.presence[t.user.id]}}).sort(function(e,t){return t.lastSeenAt-e.lastSeenAt})},serializeAttachment:function(e){var t=e.type.split("/")[0];return{_id:e._id,icon:h[e.type]||h[t]||"fa-file-o",preview:"image"===t,label:e.name,menu:n.isAllowedTo("FAP:MANAGE","FN:master","FN:leader","FN:process-engineer","FN:process-engineer-NPI")||e.user&&e.user.id===n.data._id}},canDelete:function(){return n.isAllowedTo(this.privilegePrefix+":MANAGE")},change:function(e,t,a){void 0===a&&(a=this.get(e));var s={date:new Date,user:n.getInfo(),data:{},comment:""},i={};s.data[e]=[a,t],i[e]=t,this.handleChange(s),this.update(i)},multiChange:function(e,t){var a=this,s={date:new Date,user:n.getInfo(),data:{},comment:""},i={};Object.keys(e).forEach(function(n){var r,o;t?(r=e[n][0],o=e[n][1]):(r=a.get(n),o=e[n]),JSON.stringify(o)!==JSON.stringify(r)&&(s.data[n]=[r,o],i[n]=o)}),Object.keys(i).length&&(a.handleChange(s),a.update(i))},update:function(e){var a=this,s=t.ajax({method:"PATCH",url:"/fap/entries/"+a.id,data:JSON.stringify({socketId:r.getId(),data:e})});return s.fail(function(){a.fetch()}),s},handlePresence:function(e,t){var a=this.attributes.presence;void 0===a[e]&&(a[e]=!1),a[e]!==t&&(a[e]=t,this.trigger("change:presence",this,a,{userId:e,online:t}),this.serialized&&(this.serialized.observers=this.serializeObservers()))},handleChange:function(e){var t=this,a={changes:t.get("changes").concat(e)};Object.keys(e.data).forEach(function(s){var i=t.propChangeHandlers[s];1===i?a[s]=e.data[s][1]:i&&i.call(t.propChangeHandlers,a,t,e.data[s],e)}),t.set(a)},propChangeHandlers:{subscribers:function(e,t,a){var s=t.get("observers");null===a[0]?this.addObservers(e,t,s,a[1]):null===a[1]&&this.removeObservers(e,t,s,a[0])},addObservers:function(e,t,a,s){var i={};a.forEach(function(e){i[e.user.id]=!0});var n=[].concat(a);s.forEach(function(e){i[e.id]||(n.push({user:e}),i[e.id]=!0)}),e.observers=n},removeObservers:function(e,t,a,s){var i={};s.forEach(function(e){i[e.id]=!0}),e.observers=a.filter(function(e){return!i[e.user.id]})},attachments:function(e,t,a){var s=t.get("attachments");null===a[0]?this.addAttachments(e,t,s,a[1]):null===a[1]?this.removeAttachments(e,t,s,a[0]):this.editAttachments(e,t,s,a[1])},addAttachments:function(e,t,a,s){var i={};a.forEach(function(e){i[e._id]=!0});var n=[].concat(a);s.forEach(function(e){i[e._id]||(n.push(e),i[e.id]=!0)}),e.attachments=n},removeAttachments:function(e,t,a,s){var i={};s.forEach(function(e){i[e._id]=!0}),e.attachments=a.filter(function(e){return!i[e._id]})},editAttachments:function(e,t,a,s){var i={};s.forEach(function(e){i[e._id]=e}),e.attachments=a.map(function(e){return i[e._id]||e})},status:1,startedAt:1,finishedAt:1,problem:1,solution:1,solver:1,category:1,divisions:1,lines:1,why5:1,solutionSteps:1,assessment:1,analysisNeed:1,analysisDone:1,analysisStartedAt:1,analysisFinishedAt:1,orderNo:1,mrp:1,nc12:1,productName:1,qtyTodo:1,qtyDone:1,analyzers:1}},{AUTH_PROPS:{status:!0,analysisNeed:!0,analysisDone:!0,analyzers:!0}})});