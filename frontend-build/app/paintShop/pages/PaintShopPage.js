// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/viewport","app/core/View","app/core/util/bindLoadingMessage","app/core/util/getShiftStartInfo","../PaintShopOrder","../views/PaintShopQueueView","../views/PaintShopListView","app/paintShop/templates/page"],function(e,t,i,n,s,r,o,a,d,l,u,h){"use strict";return r.extend({template:h,layoutName:"page",pageId:"paintShop",breadcrumbs:function(){return[i.bound("paintShop","BREADCRUMBS:base"),i.bound("paintShop","BREADCRUMBS:queue"),{href:"#paintShop/"+this.orders.getDateFilter(),label:this.orders.getDateFilter("L")}]},actions:function(){var e=[{type:"link",icon:"filter",className:"disabled",callback:function(){}},{type:"link",icon:"paint-brush",className:"disabled",callback:function(){}},{type:"link",icon:"truck",className:"disabled",callback:function(){}}];return window.parent===window&&e.push({type:"link",icon:"arrows-alt",callback:this.toggleFullscreen.bind(this)}),e},localTopics:{"socket.connected":function(){this.$el.removeClass("paintShop-is-disconnected")},"socket.disconnected":function(){this.$el.addClass("paintShop-is-disconnected")}},remoteTopics:{shiftChanged:function(e){1===e.no&&this.orders.isDateCurrent()&&this.orders.fetch({reset:!0})},"paintShop.orders.imported":function(e){var t=this.orders.getDateFilter(),i=n.format(e.date,"YYYY-MM-DD");i===t&&this.orders.fetch({reset:!0})},"paintShop.orders.updated.**":function(e){var t=this.orders.get(e._id);t&&t.set(d.parse(e))}},events:{},initialize:function(){this.onResize=e.debounce(this.resize.bind(this),30),this.defineModels(),this.defineViews(),this.defineBindings(),this.setView("#-queue",this.queueView),this.setView("#-list",this.listView)},setUpLayout:function(e){this.layout=e},destroy:function(){document.body.style.overflow="",document.body.classList.remove("paintShop-is-fullscreen"),t(".modal").addClass("fade"),t(window).off("."+this.idPrefix),t(document).off("."+this.idPrefix)},defineModels:function(){this.orders=o(this.model.orders,this)},defineViews:function(){this.queueView=new l({model:this.orders}),this.listView=new u({model:this.orders})},defineBindings:function(){var e=this,i=e.idPrefix,n=e.handleDragEvent.bind(e);e.listenTo(e.orders,"reset",this.onOrdersReset),t(document).on("dragstart."+i,n).on("dragenter."+i,n).on("dragleave."+i,n).on("dragover."+i,n).on("drop."+i,e.onDrop.bind(e)).on("click."+i,".page-breadcrumbs",this.onBreadcrumbsClick.bind(this)),t(window).on("resize."+i,this.onResize)},load:function(e){return e(this.orders.fetch({reset:!0}))},applyPendingChanges:function(){this.pendingChanges&&(this.pendingChanges.forEach(this.applyChanges,this),this.pendingChanges=null)},applyChanges:function(e){if(e instanceof d){var t=e,i=this.orders.get(t.id);i?t.get("updatedAt")>i.get("updatedAt")&&i.set(t.attributes):this.requests.add(t)}else{var n=this.requests.get(e._id);if(!n)return this.scheduleOrdersReload();e.updatedAt>n.get("updatedAt")&&n.set(e)}},scheduleOrdersReload:function(){clearTimeout(this.timers.reloadOrders),this.timers.reloadOrders=setTimeout(function(e){e.promised(e.orders.fetch({reset:!0}))},1,this)},serialize:function(){return{idPrefix:this.idPrefix,height:this.calcInitialHeight()+"px"}},beforeRender:function(){document.body.style.overflow="hidden",document.body.classList.toggle("paintShop-is-fullscreen",this.isFullscreen())},afterRender:function(){t(".modal.fade").removeClass("fade"),this.resize()},resize:function(){this.el.style.height=this.calcHeight()+"px"},isFullscreen:function(){return window.parent!==window||this.options.fullscreen||window.innerWidth<=800||window.outerWidth===window.screen.width&&window.outerHeight===window.screen.height},calcInitialHeight:function(){var e=window.innerHeight-15;return e-=this.isFullscreen()?64:151},calcHeight:function(){var e=this.isFullscreen(),i=window.innerHeight-15;return document.body.classList.toggle("paintShop-is-fullscreen",e),i-=e?t(".hd").outerHeight(!0)+30:t(".hd").outerHeight(!0)+t(".ft").outerHeight(!0)},toggleFullscreen:function(){this.options.fullscreen=!this.options.fullscreen,this.broker.publish("router.navigate",{url:this.genClientUrl(),replace:!0,trigger:!1}),this.resize()},handleDragEvent:function(e){e.preventDefault(),e.stopPropagation()},onDrop:function(t){if(t=t.originalEvent,t.preventDefault(),t.stopPropagation(),!t.dataTransfer.files.length)return s.msg.show({type:"warning",time:3e3,text:i("paintShop","msg:filesOnly")});var r=e.find(t.dataTransfer.files,function(e){return/vnd.ms-excel.sheet|spreadsheetml.sheet/.test(e.type)&&/\.xls[xm]$/.test(e.name)});if(!r)return s.msg.show({type:"warning",time:3e3,text:i("paintShop","msg:invalidFile")});s.msg.loading();var o=new FormData;o.append("queue",r);var a=this,d=a.ajax({type:"POST",url:"/paintShop/orders;import",data:o,processData:!1,contentType:!1});d.fail(function(){s.msg.loadingFailed()}),d.done(function(e){s.msg.loaded(),a.orders.setDateFilter(n.utc.format(e.date,"YYYY-MM-DD")),a.promised(a.orders.fetch({reset:!0}))})},genClientUrl:function(){return this.orders.genClientUrl()+(this.options.fullscreen?"?fullscreen=1":"")},onOrdersReset:function(){var e=this;e.layout&&e.layout.setBreadcrumbs(e.breadcrumbs,e),e.broker.publish("router.navigate",{url:this.genClientUrl(),trigger:!1,replace:!0})},onBreadcrumbsClick:function(e){function i(e){""===e&&(e=a(Date.now()).moment.format("YYYY-MM-DD"));var t=n.getMoment(e,"YYYY-MM-DD");d.remove(),t.isValid()&&e!==o?(r.orders.setDateFilter(e),r.orders.fetch({reset:!0})):e=o,s.innerHTML='<a href="#paintShop/'+e+'">'+n.getMoment(e,"YYYY-MM-DD").format("L")+"</a>"}if("A"===e.target.tagName){var s=e.target.parentNode;s.innerHTML="";var r=this,o=r.orders.getDateFilter("YYYY-MM-DD"),d=t('<input type="date" class="form-control paintShop-dateBreadcrumb">').val(o).appendTo(s).focus().on("keyup",function(e){return 13===e.keyCode?(i(d.val()),!1):27===e.keyCode?(i(null),!1):void 0}).on("blur",function(){i(d.val())});return!1}}})});