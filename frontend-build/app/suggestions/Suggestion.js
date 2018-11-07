define(["underscore","../i18n","../time","../user","../core/Model","app/kaizenOrders/dictionaries","app/core/templates/userInfo"],function(e,t,r,i,s,n,a){"use strict";var o=["date","kaizenStartDate","kaizenFinishDate"],u=["createdAt","updatedAt","confirmedAt"],c=["creator","updater","confirmer"],l=["suggestionOwners","kaizenOwners"];return t=t.forDomain("suggestions"),s.extend({urlRoot:"/suggestions",clientUrlRoot:"#suggestions",topicPrefix:"suggestions",privilegePrefix:"SUGGESTIONS",nlsDomain:"suggestions",labelAttribute:"rid",defaults:function(){return{status:"new",date:new Date}},initialize:function(){this.on("reset change",this.prepareUsers),this.prepareUsers()},serialize:function(e){var i=e&&e.longDateTime,s=i?"LL":"L",f=i?"LLLL":"L, LTS",g=this.toJSON();return g.status=t(e&&e.nlsDomain||"suggestions","status:"+g.status),g.section=n.sections.getLabel(g.section),g.categories=(g.categories||[]).map(function(e){return n.categories.getLabel(e)}).join("; "),g.productFamily=n.productFamilies.getLabel(g.productFamily)||"-",o.forEach(function(e){g[e]=g[e]?r.format(g[e],s):null}),u.forEach(function(e){g[e]=g[e]?r.format(g[e],f):null}),c.forEach(function(e){g[e]=a({userInfo:g[e]})}),l.forEach(function(e){g[e]=(g[e]||[]).map(function(e){return e.rendered})}),Array.isArray(g.attachments)||(g.attachments=[]),g},serializeRow:function(r){var i=this.serialize(r);i.observer&&i.observer.notify&&e.isEmpty(i.observer.changes)&&(i.className="is-changed");var s=i.owners;return s&&(i.owners=1===s.length?s[0].rendered:t(r&&r.nlsDomain||"suggestions","LIST:owners",{first:s[0].rendered,count:s.length-1})),i},serializeDetails:function(){var t=this.serialize({longDateTime:!0});return t.changed=t.observer.changes||{},delete t.changed.all,t.changed.all=t.observer.notify&&e.isEmpty(t.observer.changes),t},isCreator:function(){return this.attributes.creator&&this.attributes.creator.id===i.data._id},isConfirmer:function(){return this.attributes.confirmer&&this.attributes.confirmer.id===i.data._id},isNotSeen:function(){return this.attributes.observer.notify},canEdit:function(){if(i.isAllowedTo(this.privilegePrefix+":MANAGE"))return!0;var t=this.attributes;return!(!i.isLoggedIn()||"finished"===t.status||"cancelled"===t.status)&&(!(!this.isCreator()&&!this.isConfirmer())||e.any(l,function(r){return e.any(t[r],function(e){return e.id===i.data._id})}))},canDelete:function(){return i.isLoggedIn()&&(i.isAllowedTo(this.privilegePrefix+":MANAGE")||"new"===this.get("status")&&this.isCreator())},markAsSeen:function(){var e=this.attributes.observer;if(e.notify){e.lastSeenAt=new Date,e.notify=!1,e.changes={};var t=this.attributes.observers;this.attributes.observers=null,this.set("observers",t),this.trigger("seen")}},prepareUsers:function(){this.attributes.observers&&this.prepareObserver(),this.attributes.suggestionOwners&&this.prepareOwners()},prepareObserver:function(){var t=this.get("observers")||[],r=e.find(t,function(e){return e.user.id===i.data._id});this.attributes.observer=r||{user:{id:i.data._id,label:i.getLabel()},role:"viewer",lastSeenAt:null,notify:!1,changes:{}},r&&"string"==typeof r.lastSeenAt&&(r.lastSeenAt=new Date(r.lastSeenAt)),this.trigger("change:observer")},prepareOwners:function(){var t=this.attributes,r={};l.forEach(function(e){t[e]=(t[e]||[]).map(function(e){return e.rendered=a({userInfo:e}),r[e.id]||(r[e.id]=e),e})}),t.owners=e.values(r),this.trigger("change:owners")}},{DATE_PROPERTIES:o})});