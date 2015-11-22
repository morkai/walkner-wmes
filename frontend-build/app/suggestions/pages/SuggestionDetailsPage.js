// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/user","app/viewport","app/core/pages/DetailsPage","app/core/util/pageActions","app/kaizenOrders/dictionaries","../views/SuggestionDetailsView","../views/SuggestionHistoryView","app/suggestions/templates/detailsPage"],function(e,s,t,i,o,n,r,a,l){"use strict";return i.extend({template:l,baseBreadcrumb:!0,localTopics:{"suggestions.seen":"onSeen"},actions:function(){var s=[];this.model.isNotSeen()&&s.push({id:"markAsSeen",icon:"eye",label:e("suggestions","PAGE_ACTION:markAsSeen"),callback:this.markAsSeen.bind(this)});var t=this.model.get("observer");return"subscriber"===t.role?s.push({id:"unobserve",icon:"eye-slash",label:e("suggestions","PAGE_ACTION:unobserve"),callback:this.unobserve.bind(this)}):"viewer"===t.role&&s.push({id:"observe",icon:"eye",label:e("suggestions","PAGE_ACTION:observe"),callback:this.observe.bind(this)}),this.model.canEdit()&&s.push(o.edit(this.model,!1)),this.model.canDelete()&&s.push(o["delete"](this.model,!1)),s},initialize:function(){i.prototype.initialize.apply(this,arguments),this.setView(".suggestions-detailsPage-properties",this.detailsView),this.setView(".suggestions-detailsPage-history",this.historyView)},destroy:function(){i.prototype.destroy.call(this),n.unload()},defineViews:function(){this.detailsView=new r({model:this.model}),this.historyView=new a({model:this.model})},load:function(e){return e(this.model.fetch(),n.load())},setUpLayout:function(e){this.listenTo(this.model,"reset change",function(){e.setActions(this.actions,this)})},afterRender:function(){i.prototype.afterRender.call(this),n.load()},markAsSeen:function(s){var i=s.currentTarget.querySelector(".btn");i.disabled=!0,this.socket.emit("suggestions.markAsSeen",{_id:this.model.id},function(s){s&&(t.msg.show({type:"error",time:3e3,text:e("suggestions","MSG:markAsSeen:failure")}),i.disabled=!1)})},observe:function(s){var i=s.currentTarget.querySelector(".btn");i.disabled=!0,this.socket.emit("suggestions.observe",{_id:this.model.id,state:!0},function(s){s&&(t.msg.show({type:"error",time:3e3,text:e("suggestions","MSG:observe:failure")}),i.disabled=!1)})},unobserve:function(s){var i=s.currentTarget.querySelector(".btn");i.disabled=!0,this.socket.emit("suggestions.observe",{_id:this.model.id,state:!1},function(s){s&&(t.msg.show({type:"error",time:3e3,text:e("suggestions","MSG:unobserve:failure")}),i.disabled=!1)})},onSeen:function(e){e===this.model.id&&this.model.markAsSeen()}})});