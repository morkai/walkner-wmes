define(["underscore","../i18n","../time","../user","../core/Model","app/kaizenOrders/dictionaries","app/core/templates/userInfo"],function(t,e,r,i,n,s,a){"use strict";var o=["date"],u=["createdAt","updatedAt"],c=["creator","updater","owner","confirmer"];return n.extend({urlRoot:"/minutesForSafetyCards",clientUrlRoot:"#minutesForSafetyCards",topicPrefix:"minutesForSafetyCards",privilegePrefix:"KAIZEN",nlsDomain:"minutesForSafetyCards",labelAttribute:"rid",defaults:function(){return{date:new Date,owner:i.getInfo()}},serialize:function(t){var e=t&&t.longDateTime,i=e?"LL":"L",n=e?"LLLL":"L, LTS",f=this.toJSON();return f.version=this.getVersion(),f.section=s.sections.getLabel(f.section),o.forEach(function(t){f[t]=f[t]?r.format(f[t],i):null}),u.forEach(function(t){f[t]=f[t]?r.format(f[t],n):null}),c.forEach(function(t){f[t]=a({userInfo:f[t]})}),f.participants=f.participants.map(function(t){return a({userInfo:t})}),f},serializeRow:function(t){return this.serialize(t)},serializeDetails:function(){return this.serialize({longDateTime:!0})},isCreator:function(){return this.attributes.creator&&this.attributes.creator.id===i.data._id},isOwner:function(){return this.attributes.owner&&this.attributes.owner.id===i.data._id},isConfirmer:function(){return this.attributes.confirmer&&this.attributes.confirmer.id===i.data._id},canEdit:function(){return i.isAllowedTo(this.privilegePrefix+":MANAGE")||this.isCreator()||this.isOwner()||this.isConfirmer()},canDelete:function(){return this.canEdit()},getVersion:function(){return Array.isArray(this.attributes.causes)&&this.attributes.causes.length>0?2:(Date.parse(this.attributes.createdAt)||Date.now())>=15673104e5?2:1}})});