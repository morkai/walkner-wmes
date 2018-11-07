define(["underscore","../i18n","../time","../user","../core/Model","./dictionaries","app/core/templates/userInfo"],function(e,t,r,n,s,i,a){"use strict";var o=["kaizenStartDate","kaizenFinishDate"],u=["createdAt","updatedAt","confirmedAt"],l=["creator","updater","confirmer"],c=["nearMissOwners","suggestionOwners","kaizenOwners"];return s.extend({urlRoot:"/kaizen/orders",clientUrlRoot:"#kaizenOrders",topicPrefix:"kaizen.orders",privilegePrefix:"KAIZEN",nlsDomain:"kaizenOrders",labelAttribute:"rid",defaults:function(){return{status:"new",types:window.KAIZEN_MULTI?[]:["nearMiss"],eventDate:new Date}},initialize:function(){this.on("reset change",this.prepareUsers),this.prepareUsers()},isMulti:function(){var e=this.get("types");return e.length>1||"nearMiss"!==e[0]},serialize:function(e){var n=e&&e.nlsDomain||"kaizenOrders",s=e&&e.longDateTime,f=s?"LL":"L",h=s?"LLLL":"L, LTS",d=this.toJSON();return d.types=d.types.map(function(e){return'<span class="label kaizenOrders-label-'+e+'" title="'+t(n,"type:"+e)+'">'+t(n,"type:label:"+e)+"</span>"}).join(" "),d.status=t(n,"status:"+d.status),d.eventDate=d.eventDate?r.format(d.eventDate,t(n,"PROPERTY:eventDate:"+(s?"long":"short"))):null,o.forEach(function(e){d[e]=d[e]?r.format(d[e],f):null}),u.forEach(function(e){d[e]=d[e]?r.format(d[e],h):null}),d.section=i.sections.getLabel(d.section),d.area=i.areas.getLabel(d.area),d.nearMissCategory=i.categories.getLabel(d.nearMissCategory),d.suggestionCategory=i.categories.getLabel(d.suggestionCategory),d.cause=i.causes.getLabel(d.cause),d.risk=i.risks.getLabel(d.risk),d.kaizenDuration=d.kaizenDuration?r.toString(d.kaizenDuration):null,l.forEach(function(e){d[e]=a({userInfo:d[e]})}),c.forEach(function(e){d[e]=(d[e]||[]).map(function(e){return e.rendered})}),Array.isArray(d.attachments)||(d.attachments=[]),d},serializeRow:function(r){var n=this.serialize(r);n.observer&&n.observer.notify&&e.isEmpty(n.observer.changes)&&(n.className="is-changed");var s=n.owners;return s&&(n.owners=1===s.length?s[0].rendered:t(r&&r.nlsDomain||"kaizenOrders","LIST:owners",{first:s[0].rendered,count:s.length-1})),n},serializeDetails:function(){var t=this.serialize({longDateTime:!0});return t.changed=t.observer.changes||{},delete t.changed.all,t.changed.all=t.observer.notify&&e.isEmpty(t.observer.changes),t},isCreator:function(){return this.attributes.creator&&this.attributes.creator.id===n.data._id},isConfirmer:function(){return this.attributes.confirmer&&this.attributes.confirmer.id===n.data._id},isNotSeen:function(){return this.attributes.observer.notify},canEdit:function(){if(n.isAllowedTo("KAIZEN:MANAGE"))return!0;var t=this.attributes;return!(!n.isLoggedIn()||"finished"===t.status||"cancelled"===t.status)&&(!(!this.isCreator()&&!this.isConfirmer())||e.any(c,function(r){return e.any(t[r],function(e){return e.id===n.data._id})}))},canDelete:function(){return n.isLoggedIn()&&(n.isAllowedTo("KAIZEN:MANAGE")||"new"===this.get("status")&&this.isCreator())},markAsSeen:function(){var e=this.attributes.observer;if(e.notify){e.lastSeenAt=new Date,e.notify=!1,e.changes={};var t=this.attributes.observers;this.attributes.observers=null,this.set("observers",t),this.trigger("seen")}},hasMultipleOwners:function(e){var t=this.attributes[e+"Owners"];return Array.isArray(t)&&t.length>1},prepareUsers:function(){this.attributes.observers&&this.prepareObserver(),this.attributes.nearMissOwners&&this.prepareOwners()},prepareObserver:function(){var t=this.get("observers")||[],r=e.find(t,function(e){return e.user.id===n.data._id});this.attributes.observer=r||{user:{id:n.data._id,label:n.getLabel()},role:"viewer",lastSeenAt:null,notify:!1,changes:{}},r&&"string"==typeof r.lastSeenAt&&(r.lastSeenAt=new Date(r.lastSeenAt)),this.trigger("change:observer")},prepareOwners:function(){var t=this.attributes,r={};c.forEach(function(e){t[e]=(t[e]||[]).map(function(e){return e.rendered=a({userInfo:e}),r[e.id]||(r[e.id]=e),e})}),t.owners=e.values(r),this.trigger("change:owners")}},{DATE_PROPERTIES:o})});