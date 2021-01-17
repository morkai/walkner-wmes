define(["require","underscore","app/i18n","app/time","app/user","app/core/Model","app/core/templates/userInfo"],function(t,e,n,s,i,r,a){"use strict";const o={new:"default",inProgress:"info",verification:"secondary",finished:"success",paused:"warning",cancelled:"danger"},c={long:!1},u={long:!0};return r.extend({labelAttribute:"rid",getModelType:function(){throw new Error("Not implemented.")},getAttachmentKinds:function(){return[]},serialize:function(){const e=t("app/wmes-osh-common/dictionaries"),n=this.toJSON();return n.status=e.getLabel("status",n.status),n.duration=this.getDuration(),n},serializeRow:function(){const e=this.constructor,n=t("app/wmes-osh-common/dictionaries"),i=this.serialize();i.className=o[this.get("status")],i.plannedAt=i.plannedAt?s.utc.format(i.plannedAt,"L"):"",e.TIME_PROPS.forEach(t=>{i[t]=i[t]?s.format(i[t],"L, LT"):""}),e.DICT_PROPS.forEach(t=>{i[t]=n.getLabel(t,i[t],c)}),e.USER_PROPS.forEach(t=>{i[t]=Array.isArray(i[t])?i[t].map(t=>a(t,{noIp:!0,clickable:!1})):a(i[t],{noIp:!0,clickable:!1})}),i.implementers&&i.implementers.length>1&&(i.implementers=i.implementers[0]+" +"+(i.implementers.length-1)),i.participants&&i.participants.length>1&&(i.participants=i.participants[0]+" +"+(i.participants.length-1));const r=this.getCurrentUser();return i.unseen=r&&r.notify,i.unseen&&(i.className+=" osh-unseen"),i.locationPath=`${i.workplace} \\ ${i.department} \\ ${i.building} \\ ${i.location}`,i.station&&(i.locationPath+=` \\ ${i.station}`),i},serializeDetails:function(){const e=this.constructor,n=t("app/wmes-osh-common/dictionaries"),i=this.serialize();return i.plannedAt=i.plannedAt?s.utc.format(i.plannedAt,"LL"):"",i.descriptions={},e.DESC_PROPS.forEach(t=>{i.descriptions[t]=n.getDescription(t,i[t])}),e.TIME_PROPS.forEach(t=>{i[t]=i[t]?s.format(i[t],"LL, LT"):""}),e.DICT_PROPS.forEach(t=>{i[t]=n.getLabel(t,i[t],u)}),e.USER_PROPS.forEach(t=>{i[t]=Array.isArray(i[t])?i[t].map(t=>a(t,{noIp:!0})):a(i[t],{noIp:!0})}),i},getCurrentUser:function(){return this.getUser(i.data._id)},getUser:function(t){return(this.get("users")||[]).find(e=>e.user.id===t)},getObserver:function(){if(this.observer)return this.observer;const t=this.getCurrentUser();return t?(this.observer=Object.assign({},t,{lastSeenAt:new Date(t.lastSeenAt),changes:Object.assign({},t.changes)}),t.notify&&(this.observer.changes.any=!0,this.observer.changes.all=!Object.keys(t.changes).length)):this.observer={user:i.getInfo(),roles:["viewer"],lastSeenAt:new Date,notify:!1,changes:{any:!1,all:!1}},this.observer},isUser:function(){return!!this.getCurrentUser()},isCreator:function(){return this.get("creator").id===i.data._id},isImplementer:function(){const t=this.get("implementers");if(Array.isArray(t))return t.some(t=>t.id===i.data._id);const e=this.get("implementer");return!!e&&e.id===i.data._id},isCoordinator:function(){return(this.get("coordinators")||[]).some(t=>t.id===i.data._id)},isParticipant:function(){return(this.get("participants")||[]).some(t=>t.id===i.data._id)},getDuration:function(){const t=Date.parse(this.get("createdAt")),e=((Date.parse(this.get("finishedAt"))||Date.now())-t)/1e3/60,s=e/60;return s>48?n("wmes-osh-common","duration:days",{duration:Math[s%24>16?"ceil":"floor"](s/24)}):s>1?n("wmes-osh-common","duration:hours",{duration:Math[e%60>30?"ceil":"floor"](e/60)}):n("wmes-osh-common","duration:minutes",{duration:Math.ceil(e)})},getAttachmentUrl:function(t){return`${this.urlRoot}/${this.id}/attachments/${t._id}/${t.file}?`},getRelation:function(){return{_id:this.get("_id"),rid:this.get("rid"),type:this.getModelType()}},handleSeen:function(){const t=this.getObserver(),e=this.getCurrentUser(),n=this.attributes.users;t.lastSeenAt=new Date,t.notify=!1,t.changes={},e&&(e.lastSeenAt=t.lastSeenAt.toISOString(),e.notify=!1,e.changes={}),this.attributes.users=null,this.set("users",n),this.trigger("seen")},handleUpdate:function(t,e){const n=this.constructor,s={},r=Object.keys(t.data);(t.comment.length||r.length)&&(s.changes=this.get("changes").concat(t)),r.forEach(e=>{const i=n.changeHandlers[e],r=t.data[e][0],a=t.data[e][1];if(i){const o={prop:e,newData:s,newValue:a,oldValue:r,change:t,Model:n,model:this};"string"==typeof i?n.changeHandlers[i](o):i(o)}else s[e]=a});const a=this.attributes.users,o=this.getObserver();let c=this.getCurrentUser(),u=!1;o.user.id===t.user.id?(u=!0,o.lastSeenAt=new Date(t.date),o.notify=!1,o.changes={any:!1,all:!1}):(o.notify=!0,o.changes=e[o.user.id]||{},o.changes.all=!Object.keys(o.changes).length,o.changes.any=!0),c||o.user.id!==t.user.id||(c={user:i.getInfo(),roles:["subscriber"],lastSeenAt:t.date,notify:!1,changes:{}},a.push(c)),c&&(c.user.id===t.user.id?(c.lastSeenAt=t.date,c.notify=!1,c.changes={}):(c.notify=!0,c.changes=e[c.user.id]||{}),this.attributes.users=null,s.users=a),this.set(s),u&&this.trigger("seen")}},{STATUS_TO_CLASS:o,changeHandlers:{list:({model:t,prop:n,newData:s,newValue:i})=>{const{added:r,edited:a,deleted:o}=i||{},c=new Map;(t.get(n)||[]).forEach(t=>c.set(t._id||t.id,t)),(r||[]).forEach(t=>c.set(t._id||t.id,t)),(o||[]).forEach(t=>c.delete(t._id||t.id)),(a||[]).forEach(t=>{const n=t._id||t.id,s=c.get(n);t.old&&(t=e.omit(t,["old"])),s?c.set(n,Object.assign({},s,t)):c.set(n,t)}),t.attributes[n]=null,s[n]=Array.from(c.values())},attachments:"list",implementers:"list",coordinators:"list",participants:"list",behaviors:"list",workConditions:"list",resolutions:"list"},can:{manage:function(){return!1},add:function(){return i.isLoggedIn()},edit:function(t){if((this.can||this).manage())return!0;switch(t.get("status")){case"new":return t.isCreator()||t.isCoordinator();case"inProgress":return t.isImplementer()||t.isCoordinator();case"verification":case"paused":return t.isCoordinator();case"finished":return t.isCoordinator()&&Date.now()-Date.parse(t.get("finishedAt"))<6048e5;default:return!1}},editKind:function(t,e){if(!e)return!0;if((this.can||this).manage())return!0;switch(t.get("status")){case"new":case"inProgress":case"verification":case"paused":return t.isCoordinator();default:return!1}},delete:function(t){return!!(this.can||this).manage()||!("new"!==t.get("status")||!t.isCoordinator())},inProgress:function(t){if(Array.isArray(t.get("resolutions")))return!1;const e=t.get("status");return("new"===e||"verification"===e||"paused"===e)&&(!!(this.can||this).manage()||t.isCoordinator())},verification:function(t){if(Array.isArray(t.get("resolutions")))return!1;return"inProgress"===t.get("status")&&(!!(this.can||this).manage()||(t.isImplementer()||t.isCoordinator()))},finished:function(t){if(Array.isArray(t.get("resolutions")))return!1;return"verification"===t.get("status")&&(!!(this.can||this).manage()||t.isCoordinator())},paused:function(t){const e=t.get("status");return("new"===e||"verification"===e)&&(!!(this.can||this).manage()||t.isCoordinator())},cancelled:function(t){const e=t.get("status");return"finished"!==e&&"cancelled"!==e&&(!!(this.can||this).manage()||("new"===e?t.isImplementer()||t.isCoordinator():("inProgress"===e||"verification"===e)&&t.isCoordinator()))},editAttachment:function(t){return!!(this.can||this).manage()||"finished"!==t.get("status")&&t.isUser()},deleteAttachment:function(t,e){return!!(this.can||this).manage()||"finished"!==t.get("status")&&(!!t.isCoordinator()||e.user.id===i.data._id)},comment:function(){return i.isLoggedIn()}}})});