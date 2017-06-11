// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../time","../user","../core/Model","app/d8Entries/dictionaries","app/core/templates/userInfo"],function(e,t,r,i,s,n,a){"use strict";var o=["crsRegisterDate","d8CloseDate","d5CloseDate","d5PlannedCloseDate"],u=["createdAt","updatedAt"],l=["creator","updater","owner"],c=["members"];return t=t.forDomain("d8Entries"),s.extend({urlRoot:"/d8/entries",clientUrlRoot:"#d8/entries",topicPrefix:"d8.entries",privilegePrefix:"D8",nlsDomain:"d8Entries",labelAttribute:"rid",defaults:function(){return{status:"open"}},initialize:function(){this.on("reset change",this.prepareUsers),this.prepareUsers()},serialize:function(e){var i=e&&e.longDateTime,s=i?"LL":"L",d=i?"LLLL":"L, LTS",h=this.toJSON();return h.statusText=t("status:"+h.status),h.area=n.areas.getLabel(h.area)||"-",h.entrySource=n.entrySources.getLabel(h.entrySource)||"-",h.problemSource=n.problemSources.getLabel(h.problemSource)||"-",o.forEach(function(e){h[e]=h[e]?r.format(h[e],s):null}),u.forEach(function(e){h[e]=h[e]?r.format(h[e],d):null}),l.forEach(function(e){h[e]=a({userInfo:h[e]})}),c.forEach(function(e){h[e]=(h[e]||[]).map(function(e){return e.rendered})}),h},serializeRow:function(r){var i=this.serialize(r);i.observer&&i.observer.notify&&e.isEmpty(i.observer.changes)&&(i.className="is-changed");var s=i.strips,n=[],a=[],o=[].concat(i.team),u=[];return e.forEach(s,function(e,t){n.push(e.no||"&nbsp;"),a.push(e.family||"&nbsp;"),o.length&&t<s.length&&u.push(o.shift())}),!i.strips.length&&o.length?u.push(o.shift()):1===i.strips.length?(i.stripNos=n[0],i.stripFamilies=a[0]):i.strips.length>1&&(i.stripNos="<ul><li>"+n.join("<li>")+"</ul>",i.stripFamilies="<ul><li>"+a.join("<li>")+"</ul>"),1===i.team.length?i.team=i.team[0].rendered:i.team.length<=i.strips.length?i.team=i.team.map(function(e){return e.rendered}).join(",<br>"):i.team=t("LIST:team",{first:u.map(function(e){return e.rendered}).join(",<br>"),count:o.length}),i.d5CloseDate&&(i.d5CloseDate+=' <i class="fa fa-thumbs-'+(i.d5CloseDateOk?"up":"down")+'"></i>'),i},serializeDetails:function(){var t=this.serialize({longDateTime:!0});return t.changed=t.observer.changes||{},delete t.changed.all,t.changed.all=t.observer.notify&&e.isEmpty(t.observer.changes),t},isManager:function(){return this.attributes.manager&&this.attributes.manager.id===i.data._id},isCreator:function(){return this.attributes.creator&&this.attributes.creator.id===i.data._id},isOwner:function(){return this.attributes.owner&&this.attributes.owner.id===i.data._id},isMember:function(){return e.some(this.attributes.members,function(e){return e.id===i.data._id})},isNotSeen:function(){return this.attributes.observer.notify},getUserRoles:function(){return{admin:i.isAllowedTo("D8:MANAGE"),manager:this.isManager(),creator:this.isCreator(),owner:this.isOwner(),member:this.isMember(),observer:!0}},canEdit:function(){return!!i.isAllowedTo(this.privilegePrefix+":MANAGE")||"closed"!==this.get("status")&&(this.isCreator()||this.isOwner()||this.isManager())},canDelete:function(){return!!i.isAllowedTo(this.privilegePrefix+":MANAGE")||!("open"!==this.get("status")||!this.isCreator())&&r.getMoment(this.get("createdAt")).diff(Date.now(),"minutes")>=-10},markAsSeen:function(){var e=this.attributes,t=e.observer;if(t.notify){t.lastSeenAt=new Date,t.notify=!1,t.changes={};var r=e.observers;e.observers=null,this.set("observers",r),this.trigger("seen")}},prepareUsers:function(){this.attributes.observers&&this.prepareObserver(),this.prepareTeam()},prepareObserver:function(){var t=this.get("observers")||[],r=e.find(t,function(e){return e.user.id===i.data._id});this.attributes.observer=r||{user:{id:i.data._id,label:i.getLabel()},role:"viewer",lastSeenAt:null,notify:!1,changes:{}},r&&"string"==typeof r.lastSeenAt&&(r.lastSeenAt=new Date(r.lastSeenAt)),this.trigger("change:observer")},prepareTeam:function(){var t=this.attributes,r={};t.owner&&(t.owner.rendered=a({userInfo:t.owner}),r[t.owner.id]=t.owner),c.forEach(function(e){t[e]=(t[e]||[]).filter(function(e){return!!e&&!!e.id}).map(function(e){return e.rendered=a({userInfo:e}),r[e.id]||(r[e.id]=e),e})}),t.team=e.values(r),this.trigger("change:team")}},{DATE_PROPERTIES:o})});