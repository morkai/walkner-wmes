// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../time","../user","../core/Model","app/d8Entries/dictionaries","app/core/templates/userInfo"],function(e,t,r,i,n,s,a){"use strict";var o=["crsRegisterDate","d8OpenDate","d8CloseDate","d5CloseDate","d5PlannedCloseDate"],u=["createdAt","updatedAt"],l=["creator","updater","owner"],c=["members"];return t=t.forDomain("d8Entries"),n.extend({urlRoot:"/d8/entries",clientUrlRoot:"#d8/entries",topicPrefix:"d8.entries",privilegePrefix:"D8",nlsDomain:"d8Entries",labelAttribute:"rid",defaults:function(){return{status:"open"}},initialize:function(){this.on("reset change",this.prepareUsers),this.prepareUsers()},serialize:function(e){var i=e&&e.longDateTime,n=i?"LL":"L",d=i?"LLLL":"L, HH:mm:ss",f=this.toJSON();return f.statusText=t("status:"+f.status),f.entrySource=s.entrySources.getLabel(f.entrySource)||"-",f.problemSource=s.problemSources.getLabel(f.problemSource)||"-",o.forEach(function(e){f[e]=f[e]?r.format(f[e],n):null}),u.forEach(function(e){f[e]=f[e]?r.format(f[e],d):null}),l.forEach(function(e){f[e]=a({userInfo:f[e]})}),c.forEach(function(e){f[e]=(f[e]||[]).map(function(e){return e.rendered})}),f},serializeRow:function(i){var n=this.serialize(i);n.observer&&n.observer.notify&&e.isEmpty(n.observer.changes)&&(n.className="is-changed");var s=n.strips,a=[],o=[],u=[],l=[].concat(n.team),c=[];return e.forEach(s,function(e,t){a.push(e.no||"&nbsp;"),o.push(e.date?r.format(e.date,"L"):"&nbsp;"),u.push(e.family||"&nbsp;"),l.length&&t<s.length&&c.push(l.shift())}),1===n.strips.length?(n.stripNos=a[0],n.stripDates=o[0],n.stripFamilies=u[0]):n.strips.length>1&&(n.stripNos="<ul><li>"+a.join("<li>")+"</ul>",n.stripDates="<ul><li>"+o.join("<li>")+"</ul>",n.stripFamilies="<ul><li>"+u.join("<li>")+"</ul>"),1===n.team.length?n.team=n.team[0].rendered:n.team.length<=n.strips.length?n.team=n.team.map(function(e){return e.rendered}).join(",<br>"):n.team=t("LIST:team",{first:c.map(function(e){return e.rendered}).join(",<br>"),count:l.length}),n},serializeDetails:function(){var t=this.serialize({longDateTime:!0});return t.changed=t.observer.changes||{},delete t.changed.all,t.changed.all=t.observer.notify&&e.isEmpty(t.observer.changes),t},isCreator:function(){return this.attributes.creator&&this.attributes.creator.id===i.data._id},isOwner:function(){return this.attributes.owner&&this.attributes.owner.id===i.data._id},isNotSeen:function(){return this.attributes.observer.notify},canEdit:function(){var t=i.isAllowedTo(this.privilegePrefix+":ALL");if(t)return!0;var r=this.attributes;return"closed"===r.status?!1:this.isCreator()||this.isOwner()?!0:e.any(c,function(t){return e.any(r[t],function(e){return e.id===i.data._id})})},canDelete:function(){return i.isAllowedTo(this.privilegePrefix+":ALL")||"open"===this.get("status")&&this.isCreator()},markAsSeen:function(){var e=this.attributes,t=e.observer;if(t.notify){t.lastSeenAt=new Date,t.notify=!1,t.changes={};var r=e.observers;e.observers=null,this.set("observers",r),this.trigger("seen")}},prepareUsers:function(){this.attributes.observers&&this.prepareObserver(),this.prepareTeam()},prepareObserver:function(){var t=this.get("observers")||[],r=e.find(t,function(e){return e.user.id===i.data._id});this.attributes.observer=r||{user:{id:i.data._id,label:i.getLabel()},role:"viewer",lastSeenAt:null,notify:!1,changes:{}},r&&"string"==typeof r.lastSeenAt&&(r.lastSeenAt=new Date(r.lastSeenAt)),this.trigger("change:observer")},prepareTeam:function(){var t=this.attributes,r={};t.owner&&(t.owner.rendered=a({userInfo:t.owner}),r[t.owner.id]=t.owner),c.forEach(function(e){t[e]=(t[e]||[]).filter(function(e){return!!e&&!!e.id}).map(function(e){return e.rendered=a({userInfo:e}),r[e.id]||(r[e.id]=e),e})}),t.team=e.values(r),this.trigger("change:team")}},{DATE_PROPERTIES:o})});