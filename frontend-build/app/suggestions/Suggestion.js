define(["underscore","../i18n","../time","../user","../core/Model","app/kaizenOrders/dictionaries","app/core/templates/userInfo"],function(e,t,i,n,r,s,a){"use strict";var o=["date","kaizenStartDate","kaizenFinishDate"],c=["createdAt","updatedAt","confirmedAt","finishedAt"],u=["creator","updater","confirmer","superior"],f=["suggestionOwners","kaizenOwners"];return t=t.forDomain("suggestions"),r.extend({urlRoot:"/suggestions",clientUrlRoot:"#suggestions",topicPrefix:"suggestions",privilegePrefix:"SUGGESTIONS",nlsDomain:"suggestions",labelAttribute:"rid",defaults:function(){return{status:"new",date:new Date}},initialize:function(){this.on("reset change",this.prepareUsers),this.prepareUsers()},serialize:function(n){var r=n&&n.longDateTime,h=r?"LL":"L",d=r?"LLL":"L, LTS",g=this.toJSON();return g.status=t(n&&n.nlsDomain||"suggestions","status:"+g.status),g.section=s.sections.getLabel(g.section),g.categories=(g.categories||[]).map(function(e){return s.categories.getLabel(e)}).join("; "),g.productFamily=g.kaizenEvent||s.productFamilies.getLabel(g.productFamily)||"",o.forEach(function(e){g[e]=g[e]?i.format(g[e],h):null}),c.forEach(function(e){g[e]=g[e]?i.format(g[e],d):null}),u.forEach(function(e){g[e]=a({userInfo:g[e],noIp:!0})}),f.forEach(function(e){g[e]=(g[e]||[]).map(function(e){return e.rendered})}),g.coordSections=(g.coordSections||[]).map(function(t){var n=s.sections.get(t._id);return e.defaults({name:n?n.getLabel():t._id,user:t.user?a({userInfo:t.user}):"-",time:t.time?i.format(t.time,"LLLL"):"-",users:(t.users||[]).map(function(e){return a({userInfo:e})})},t)}),Array.isArray(g.attachments)||(g.attachments=[]),g},serializeRow:function(n){var r=this.serialize(n);r.className="",r.observer&&r.observer.notify&&e.isEmpty(r.observer.changes)&&(r.className+=" is-changed");var s=r.owners;switch(s&&(r.owners=1===s.length?s[0].rendered:t(n&&n.nlsDomain||"suggestions","LIST:owners",{first:s[0].rendered,count:s.length-1})),r.finishedAt=r.finishedAt?i.format(this.get("finishedAt"),"L"):"",this.get("status")){case"finished":this.get("kom")?(r.className+=" warning",r.status+=' <i class="fa fa-trophy"></i>'):r.className+=" success";break;case"cancelled":r.className+=" danger";break;case"inProgress":r.className+=" active";break;case"accepted":case"verification":r.className=" info"}return r},serializeDetails:function(){var t=this,i=this.constructor,n=this.serialize({longDateTime:!0});return n.changed=n.observer.changes||{},delete n.changed.all,n.changed.all=n.observer.notify&&e.isEmpty(n.observer.changes),n.coordSections.forEach(function(e){e.canCoordinate=i.can.coordinateSection(t,e._id)}),n},getAttachmentKinds:function(){return["before","after","other"]},getAttachmentUrl:function(e){return`${this.urlRoot}/${this.id}/attachments/${e._id}/${e.file}?`},isParticipant:function(){return this.attributes.observer&&"viewer"!==this.attributes.observer.role},isCreator:function(){return this.attributes.creator&&this.attributes.creator.id===n.data._id},isConfirmer:function(){return this.attributes.confirmer&&this.attributes.confirmer.id===n.data._id},isPossibleConfirmer:function(){var e=s.sections.get(this.get("section"));return!!e&&e.get("confirmers").some(function(e){return e.id===n.data._id})},isSuggestionOwner:function(){return e.some(this.get("suggestionOwners"),function(e){return e.id===n.data._id})},isKaizenOwner:function(){return e.some(this.get("kaizenOwners"),function(e){return e.id===n.data._id})},isOwner:function(){return this.isSuggestionOwner()||this.isKaizenOwner()},isCoordinator:function(){return e.some(this.get("coordSections"),function(t){return e.some(t.users,function(e){return e.id===n.data._id})})},isNotSeen:function(){return this.attributes.observer.notify},canManage:function(){return n.isAllowedTo(this.privilegePrefix+":MANAGE")},canKom:function(){return"finished"===this.get("status")&&(this.canManage()||this.isConfirmer())},canCoordinate:function(){return"new"===this.get("status")&&(!!this.canManage()||this.isCoordinator())},canAccept:function(){return"accepted"===this.get("status")&&(!!this.canManage()||this.isConfirmer())},canComplete:function(){return"inProgress"===this.get("status")&&(!!this.canManage()||(this.isConfirmer()||this.isKaizenOwner()))},canVerify:function(){return"verification"===this.get("status")&&(!!this.canManage()||this.isConfirmer())},canEdit:function(){if(!n.isLoggedIn())return!1;if(this.canManage()||this.isConfirmer()||this.isPossibleConfirmer())return!0;var e=this.get("status");return"finished"!==e&&"cancelled"!==e&&(("new"===e||"inProgress"===e)&&(this.isCreator()||this.isSuggestionOwner()||this.isKaizenOwner()))},canDelete:function(){return!!this.canManage()||"new"===this.get("status")&&this.isCreator()},markAsSeen:function(){var e=this.attributes.observer;if(e.notify){e.lastSeenAt=new Date,e.notify=!1,e.changes={};var t=this.attributes.observers;this.attributes.observers=null,this.set("observers",t),this.trigger("seen")}},prepareUsers:function(){this.attributes.observers&&this.prepareObserver(),this.attributes.suggestionOwners&&this.prepareOwners()},prepareObserver:function(){var t=this.get("observers")||[],i=e.find(t,function(e){return e.user.id===n.data._id});this.attributes.observer=i||{user:{id:n.data._id,label:n.getLabel()},role:"viewer",lastSeenAt:null,notify:!1,changes:{}},i&&"string"==typeof i.lastSeenAt&&(i.lastSeenAt=new Date(i.lastSeenAt)),this.trigger("change:observer")},prepareOwners:function(){var t=this.attributes,i={};f.forEach(function(e){t[e]=(t[e]||[]).map(function(e){return e.rendered=a({userInfo:e}),i[e.id]||(i[e.id]=e),e})}),t.owners=e.values(i),this.trigger("change:owners")},getCoordSection:function(e){return this.get("coordSections").find(function(t){return t._id===e})}},{DATE_PROPERTIES:o,can:{manage:function(){return n.isAllowedTo("SUGGESTIONS:MANAGE")},coordinate:function(e){var t=this.can||this;return(e.get("coordSections")||[]).some(function(i){return t.coordinateSection(e,i._id)})},coordinateSection:function(e,t){if((this.can||this).manage())return!0;if("new"!==e.get("status"))return!1;var i=e.getCoordSection(t);return!!i&&i.users.some(function(e){return e.id===n.data._id})},editAttachment:function(e){return!!(this.can||this).manage()||"finished"!==e.get("status")&&e.isParticipant()},deleteAttachment:function(e,t){return!!(this.can||this).manage()||"finished"!==e.get("status")&&(!!e.isCoordinator()||t.user.id===n.data._id)}}})});