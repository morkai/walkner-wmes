// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../i18n","../time","../user","../core/Model","./dictionaries","app/core/templates/userInfo"],function(e,t,r,s,i,a,n){"use strict";var o=["kaizenStartDate","kaizenFinishDate"],u=["createdAt","updatedAt","confirmedAt"],l=["creator","updater","confirmer"],c=["nearMissOwners","suggestionOwners","kaizenOwners"];return i.extend({urlRoot:"/kaizen/orders",clientUrlRoot:"#kaizen/orders",topicPrefix:"kaizen.orders",privilegePrefix:"KAIZEN",nlsDomain:"kaizenOrders",labelAttribute:"rid",defaults:{status:"new"},initialize:function(){this.on("reset change",this.prepareObserver),this.attributes.observers&&this.prepareObserver()},serialize:function(e){var s=e&&e.longDateTime,i=s?"LL":"YY-MM-DD",f=s?"LLLL":"YY-MM-DD, HH:mm:ss",d=this.toJSON();return d.types=d.types.map(function(e){return'<span class="label kaizenOrders-label-'+e+'" title="'+t("kaizenOrders","type:"+e)+'">'+t("kaizenOrders","type:label:"+e)+"</span>"}).join(" "),d.status=t("kaizenOrders","status:"+d.status),d.eventDate=d.eventDate?r.format(d.eventDate,t("kaizenOrders","PROPERTY:eventDate:"+(s?"long":"short"))):null,o.forEach(function(e){d[e]=d[e]?r.format(d[e],i):null}),u.forEach(function(e){d[e]=d[e]?r.format(d[e],f):null}),d.section=a.sections.getLabel(d.section),d.area=a.areas.getLabel(d.area),d.nearMissCategory=a.categories.getLabel(d.nearMissCategory),d.suggestionCategory=a.categories.getLabel(d.suggestionCategory),d.cause=a.causes.getLabel(d.cause),d.risk=a.risks.getLabel(d.risk),d.kaizenDuration=d.kaizenDuration?r.toString(d.kaizenDuration):null,l.forEach(function(e){d[e]=n({userInfo:d[e]})}),c.forEach(function(e){d[e]=(d[e]||[]).map(function(e){return n({userInfo:e})})}),Array.isArray(d.attachments)||(d.attachments=[]),d},serializeRow:function(){var t=this.serialize();return t.observer.notify&&e.isEmpty(t.observer.changes)&&(t.className="is-changed"),t},serializeDetails:function(){var t=this.serialize({longDateTime:!0});return t.changed=t.observer.changes||{},delete t.changed.all,t.changed.all=t.observer.notify&&e.isEmpty(t.observer.changes),t},isCreator:function(){return this.attributes.creator&&this.attributes.creator.id===s.data._id},isConfirmer:function(){return this.attributes.confirmer&&this.attributes.confirmer.id===s.data._id},isNotSeen:function(){return this.attributes.observer.notify},canEdit:function(){if(s.isAllowedTo("KAIZEN:MANAGE"))return!0;var t=this.attributes;return"finished"===t.status||"cancelled"===t.status?!1:this.isCreator()||this.isConfirmer()?!0:e.any(c,function(r){return e.any(t[r],function(e){return e.id===s.data._id})})},canDelete:function(){return s.isAllowedTo("KAIZEN:MANAGE")||"new"===this.get("status")&&this.isCreator()},markAsSeen:function(){var e=this.attributes.observer;if(e.notify){e.lastSeenAt=new Date,e.notify=!1,e.changes={};var t=this.attributes.observers;this.attributes.observers=null,this.set("observers",t),this.trigger("seen")}},prepareObserver:function(){var t=this.get("observers")||[],r=e.find(t,function(e){return e.user.id===s.data._id});this.attributes.observer=r||{user:{id:s.data._id,label:s.getLabel()},role:"viewer",lastSeenAt:null,notify:!1,changes:{}},r&&"string"==typeof r.lastSeenAt&&(r.lastSeenAt=new Date(r.lastSeenAt)),this.trigger("change:observer")}},{DATE_PROPERTIES:o})});