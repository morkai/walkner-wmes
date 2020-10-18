define(["require","app/i18n","app/time","app/user","app/core/Model","app/core/templates/userInfo"],function(t,e,n,i,s,a){"use strict";const r={new:"default",inProgress:"info",verification:"secondary",finished:"success",paused:"warning",cancelled:"danger"},o={long:!1},c={long:!0},h=["createdAt","startedAt","implementedAt","finishedAt"],u=["creator","implementers","coordinators"],d=["workplace","division","building","location","kind"],l=["kind"];return s.extend({urlRoot:"/osh/kaizens",clientUrlRoot:"#osh/kaizens",topicPrefix:"osh.kaizens",privilegePrefix:"OSH:KAIZENS",nlsDomain:"wmes-osh-kaizens",labelAttribute:"_id",initialize:function(){s.prototype.initialize.apply(this,arguments),this.observer=null,this.on("change:participants",()=>this.observer=null)},getModelType:function(){return"kaizens"},serialize:function(){const e=t("app/wmes-osh-common/dictionaries"),n=this.toJSON();return n.status=e.getLabel("status",n.status),n.duration=this.getDuration(),n},serializeRow:function(){const e=t("app/wmes-osh-common/dictionaries"),i=this.serialize();i.className=r[this.get("status")],i.plannedAt=i.plannedAt?n.utc.format(i.plannedAt,"L"):"",h.forEach(t=>{i[t]=i[t]?n.format(i[t],"L"):""}),d.forEach(t=>{i[t]=e.getLabel(t,i[t],o)}),u.forEach(t=>{i[t]=Array.isArray(i[t])?i[t].map(t=>a(t,{noIp:!0,clickable:!1})):a(i[t],{noIp:!0,clickable:!1})}),i.implementers.length>1&&(i.implementers=i.implementers[0]+" +"+(i.implementers.length-1));const s=this.getUserParticipant();return i.unseen=s&&s.notify,i.unseen&&(i.className+=" osh-unseen"),i},serializeDetails:function(){const e=t("app/wmes-osh-common/dictionaries"),i=this.serialize();return i.plannedAt=i.plannedAt?n.utc.format(i.plannedAt,"LL"):"",h.forEach(t=>{i[t]=i[t]?n.format(i[t],"LL, LT"):""}),d.forEach(t=>{i[t]=e.getLabel(t,i[t],c)}),i.descriptions={},l.forEach(t=>{i.descriptions[t]=e.getDescription(t,i[t])}),u.forEach(t=>{i[t]=Array.isArray(i[t])?i[t].map(t=>a(t,{noIp:!0})):a(i[t],{noIp:!0})}),i},getUserParticipant:function(){return this.getParticipant(i.data._id)},getParticipant:function(t){return(this.get("participants")||[]).find(e=>e.user.id===t)},getObserver:function(){if(this.observer)return this.observer;const t=this.getUserParticipant();return t?(this.observer=Object.assign({},t,{lastSeenAt:new Date(t.lastSeenAt),changes:Object.assign({},t.changes)}),t.notify&&(this.observer.changes.any=!0,this.observer.changes.all=!Object.keys(t.changes).length)):this.observer={user:i.getInfo(),roles:["viewer"],lastSeenAt:new Date,notify:!1,changes:{any:!1,all:!1}},this.observer},isParticipant:function(){return!!this.getUserParticipant()},isCreator:function(){return this.get("creator").id===i.data._id},isImplementer:function(){return(this.get("implementers")||[]).some(t=>t.id===i.data._id)},isCoordinator:function(){return(this.get("coordinators")||[]).some(t=>t.id===i.data._id)},getDuration:function(){const t=Date.parse(this.get("startedAt"));if(!t||"cancelled"===this.get("status"))return"";const n=Date.parse(this.get("finishedAt"))||Date.now(),i=Math.ceil((n-t)/1e3/3600);if(i>48){const t=Math[i%24>16?"ceil":"floor"](i/24);return e("wmes-osh-common","duration:days",{days:t})}return e("wmes-osh-common","duration:hours",{hours:i})},getAttachmentUrl:function(t){return`${this.urlRoot}/${this.id}/attachments/${t._id}/${t.file}`},handleSeen:function(){const t=this.getObserver(),e=this.getUserParticipant(),n=this.attributes.participants;t.lastSeenAt=new Date,t.notify=!1,t.changes={},e&&(e.lastSeenAt=t.lastSeenAt.toISOString(),e.notify=!1,e.changes={}),this.attributes.participants=null,this.set("participants",n),this.trigger("seen")},handleUpdate:function(t,e){const n=this.constructor,i={},s=Object.keys(t.data);(t.comment.length||s.length)&&(i.changes=this.get("changes").concat(t)),s.forEach(e=>{const s=n.changeHandlers[e],a=t.data[e][0],r=t.data[e][1];if(s){const o={prop:e,newData:i,newValue:r,oldValue:a,change:t,Model:n,model:this};"string"==typeof s?n.changeHandlers[s](o):s(o)}else i[e]=r});const a=this.attributes.participants,r=this.getUserParticipant();let o=!1;r&&(r.user.id===t.user.id?(o=!0,r.lastSeenAt=t.date,r.notify=!1,r.changes={any:!1,all:!1}):(r.notify=!0,r.changes=e[r.user.id]||{},r.changes.all=!Object.keys(r.changes).length,r.changes.any=!0),this.attributes.participants=null,i.participants=a),this.set(i),o&&this.trigger("seen")}},{changeHandlers:{list:({model:t,prop:e,newData:n,newValue:i})=>{const{added:s,edited:a,deleted:r}=i||{},o=new Map;(t.get(e)||[]).forEach(t=>o.set(t._id||t.id,t)),(s||[]).forEach(t=>o.set(t._id||t.id,t)),(r||[]).forEach(t=>o.delete(t._id||t.id)),(a||[]).forEach(t=>{const e=t._id||t.id,n=o.get(e);n?o.set(e,Object.assign({},n,t)):o.set(e,t)}),t.attributes[e]=null,n[e]=Array.from(o.values())},attachments:"list",implementers:"list",coordinators:"list"},can:{manage:function(){return i.isAllowedTo("OSH:KAIZENS:MANAGE")},edit:function(t){if((this.can||this).manage())return!0;switch(t.get("status")){case"new":return t.isCreator()||t.isCoordinator();case"inProgress":return t.isImplementer()||t.isCoordinator();case"verification":case"paused":return t.isCoordinator();default:return!1}},editKind:function(t,e){if(!e||(this.can||this).manage())return!0;switch(t.get("status")){case"new":return t.isCreator()||t.isCoordinator();case"inProgress":case"verification":case"paused":return t.isCoordinator();default:return!1}},delete:function(t){return!!(this.can||this).manage()||!("new"!==t.get("status")||!t.isCoordinator())},inProgress:function(t){const e=t.get("status");return("new"===e||"verification"===e||"paused"===e)&&(!!(this.can||this).manage()||t.isCoordinator())},verification:function(t){return"inProgress"===t.get("status")&&(!!(this.can||this).manage()||(t.isImplementer()||t.isCoordinator()))},finished:function(t){return"verification"===t.get("status")&&(!!(this.can||this).manage()||t.isCoordinator())},paused:function(t){const e=t.get("status");return("new"===e||"verification"===e)&&(!!(this.can||this).manage()||t.isCoordinator())},cancelled:function(t){const e=t.get("status");return"finished"!==e&&"cancelled"!==e&&(!!(this.can||this).manage()||("new"===e?t.isImplementer()||t.isCoordinator():("inProgress"===e||"verification"===e)&&t.isCoordinator()))},editAttachment:function(t){return!!(this.can||this).manage()||"finished"!==t.get("status")&&t.isParticipant()},deleteAttachment:function(t,e){return!!(this.can||this).manage()||"finished"!==t.get("status")&&(!!t.isCoordinator()||e.user.id===i.data._id)},comment:function(){return i.isLoggedIn()}}})});