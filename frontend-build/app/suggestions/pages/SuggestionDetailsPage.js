// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/user","app/viewport","app/core/pages/DetailsPage","app/core/util/pageActions","app/kaizenOrders/dictionaries","../views/SuggestionDetailsView","../views/SuggestionHistoryView","app/suggestions/templates/detailsPage"],function(e,s,t,i,o,n,r,a,l,d){"use strict";return o.extend({template:d,baseBreadcrumb:!0,breadcrumbs:function(){return this.options.standalone?[s.bound("suggestions","BREADCRUMBS:base"),this.model.get("rid")+""]:o.prototype.breadcrumbs.call(this)},localTopics:{"suggestions.seen":"onSeen"},actions:function(){var e=[],t=this.model;t.isNotSeen()&&e.push({id:"markAsSeen",icon:"eye",label:s("suggestions","PAGE_ACTION:markAsSeen"),callback:this.markAsSeen.bind(this)});var i=t.get("observer");return"subscriber"===i.role?e.push({id:"unobserve",icon:"eye-slash",label:s("suggestions","PAGE_ACTION:unobserve"),callback:this.unobserve.bind(this)}):"viewer"===i.role&&e.push({id:"observe",icon:"eye",label:s("suggestions","PAGE_ACTION:observe"),callback:this.observe.bind(this)}),t.canEdit()&&e.push(n.edit(t,!1)),t.canDelete()&&e.push(n.delete(t,!1)),e.push({label:s.bound(t.getNlsDomain(),"PAGE_ACTION:add"),icon:"plus",href:"#suggestions;add"}),e},initialize:function(){o.prototype.initialize.apply(this,arguments),this.setView(".suggestions-detailsPage-properties",this.detailsView),this.setView(".suggestions-detailsPage-history",this.historyView)},destroy:function(){o.prototype.destroy.call(this),r.unload(),e("body").removeClass("suggestions-standalone")},defineViews:function(){this.detailsView=new a({model:this.model}),this.historyView=new l({model:this.model})},load:function(e){return e(this.model.fetch(),r.load())},setUpLayout:function(e){this.listenTo(this.model,"reset change",function(){e.setActions(this.actions,this)})},afterRender:function(){o.prototype.afterRender.call(this),r.load(),e("body").toggleClass("suggestions-standalone",!!this.options.standalone)},markAsSeen:function(e){var t=e.currentTarget.querySelector(".btn");t.disabled=!0,this.socket.emit("suggestions.markAsSeen",{_id:this.model.id},function(e){e&&(i.msg.show({type:"error",time:3e3,text:s("suggestions","MSG:markAsSeen:failure")}),t.disabled=!1)})},observe:function(e){var t=e.currentTarget.querySelector(".btn");t.disabled=!0,this.socket.emit("suggestions.observe",{_id:this.model.id,state:!0},function(e){e&&(i.msg.show({type:"error",time:3e3,text:s("suggestions","MSG:observe:failure")}),t.disabled=!1)})},unobserve:function(e){var t=e.currentTarget.querySelector(".btn");t.disabled=!0,this.socket.emit("suggestions.observe",{_id:this.model.id,state:!1},function(e){e&&(i.msg.show({type:"error",time:3e3,text:s("suggestions","MSG:unobserve:failure")}),t.disabled=!1)})},onSeen:function(e){e===this.model.id&&this.model.markAsSeen()}})});