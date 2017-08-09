// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/viewport","app/core/View","app/core/util/bindLoadingMessage","app/core/util/getShiftStartInfo","app/production/views/VkbView","../PaintShopOrder","../views/PaintShopQueueView","../views/PaintShopListView","../views/PaintShopDatePickerView","app/paintShop/templates/page"],function(e,t,i,s,n,r,o,a,d,h,c,u,l,p){"use strict";var f=window.parent!==window;return r.extend({template:p,layoutName:"page",pageId:"paintShop",breadcrumbs:function(){return[i.bound("paintShop","BREADCRUMBS:base"),i.bound("paintShop","BREADCRUMBS:queue"),{href:"#paintShop/"+this.orders.getDateFilter(),label:this.orders.getDateFilter("L")}]},actions:function(){var e=[];return f||e.push({type:"link",icon:"arrows-alt",callback:this.toggleFullscreen.bind(this)}),e},localTopics:{"socket.connected":function(){this.$el.removeClass("paintShop-is-disconnected")},"socket.disconnected":function(){this.$el.addClass("paintShop-is-disconnected")}},remoteTopics:{shiftChanged:function(e){1===e.no&&this.orders.isDateCurrent()&&this.orders.fetch({reset:!0})},"paintShop.orders.imported":function(e){var t=this.orders.getDateFilter(),i=s.format(e.date,"YYYY-MM-DD");i===t&&this.orders.fetch({reset:!0})},"paintShop.orders.updated.**":function(e){var t=this.orders.get(e._id);t&&t.set(h.parse(e))}},events:{"click .paintShop-tab[data-mrp]":function(e){this.$(".paintShop-tab.is-active").removeClass("is-active"),this.orders.selectMrp(e.currentTarget.dataset.mrp),"all"!==this.orders.selectedMrp&&this.$(e.currentTarget).addClass("is-active")},"mousedown #-switchApps":function(e){this.startActionTimer("switchApps",e)},"touchstart #-switchApps":function(){this.startActionTimer("switchApps")},"mouseup #-switchApps":function(){this.stopActionTimer("switchApps")},"touchend #-switchApps":function(){this.stopActionTimer("switchApps")},"mousedown #-reboot":function(e){this.startActionTimer("reboot",e)},"touchstart #-reboot":function(){this.startActionTimer("reboot")},"mouseup #-reboot":function(){this.stopActionTimer("reboot")},"touchend #-reboot":function(){this.stopActionTimer("reboot")},"mousedown #-shutdown":function(e){this.startActionTimer("shutdown",e)},"touchstart #-shutdown":function(){this.startActionTimer("shutdown")},"mouseup #-shutdown":function(){this.stopActionTimer("shutdown")},"touchend #-shutdown":function(){this.stopActionTimer("shutdown")}},initialize:function(){this.onResize=e.debounce(this.resize.bind(this),30),this.actionTimer={action:null,time:null},this.defineModels(),this.defineViews(),this.defineBindings(),this.setView("#-queue",this.queueView),this.setView("#-list-all",this.allListView),this.setView("#-list-work",this.workListView),f&&this.setView("#-vkb",this.vkbView)},setUpLayout:function(e){this.layout=e},destroy:function(){t(".modal").addClass("fade"),t(document.body).css("overflow","").removeClass("paintShop-is-fullscreen paintShop-is-embedded"),t(window).off("."+this.idPrefix),t(document).off("."+this.idPrefix)},defineModels:function(){this.orders=o(this.model.orders,this)},defineViews:function(){this.vkbView=f?new d:null,this.queueView=new c({model:this.orders}),this.allListView=new u({model:this.orders,showTimes:!1,filter:null}),this.workListView=new u({model:this.orders,showTimes:!0,filter:function(e){return"started"===e.status||"finished"===e.status},sort:function(e,t){return"started"===e.status?e.status===t.status?e.startedAt-t.startedAt:-1:t.startedAt-e.startedAt}})},defineBindings:function(){var e=this,i=e.idPrefix,s=e.handleDragEvent.bind(e);e.listenTo(e.orders,"reset",this.onOrdersReset),t(document).on("dragstart."+i,s).on("dragenter."+i,s).on("dragleave."+i,s).on("dragover."+i,s).on("drop."+i,e.onDrop.bind(e)).on("click."+i,".page-breadcrumbs",this.onBreadcrumbsClick.bind(this)),t(window).on("resize."+i,this.onResize),f&&e.once("afterRender",function(){window.parent.postMessage({type:"ready",app:"paintShop"},"*")})},load:function(e){return e(this.orders.fetch({reset:!0}))},applyPendingChanges:function(){this.pendingChanges&&(this.pendingChanges.forEach(this.applyChanges,this),this.pendingChanges=null)},applyChanges:function(e){if(e instanceof h){var t=e,i=this.orders.get(t.id);i?t.get("updatedAt")>i.get("updatedAt")&&i.set(t.attributes):this.requests.add(t)}else{var s=this.requests.get(e._id);if(!s)return this.scheduleOrdersReload();e.updatedAt>s.get("updatedAt")&&s.set(e)}},scheduleOrdersReload:function(){clearTimeout(this.timers.reloadOrders),this.timers.reloadOrders=setTimeout(function(e){e.promised(e.orders.fetch({reset:!0}))},1,this)},serialize:function(){return{idPrefix:this.idPrefix,embedded:f,height:this.calcInitialHeight()+"px",tabs:this.serializeTabs()}},serializeTabs:function(){var e=this.orders;return e.allMrps.map(function(t){return{mrp:t,label:t,active:e.selectedMrp===t}})},beforeRender:function(){document.body.style.overflow="hidden",document.body.classList.toggle("paintShop-is-fullscreen",this.isFullscreen()),document.body.classList.toggle("paintShop-is-embedded",f)},afterRender:function(){t(".modal.fade").removeClass("fade"),this.resize()},resize:function(){this.el.style.height=this.calcHeight()+"px"},isFullscreen:function(){return f||this.options.fullscreen||window.innerWidth<=800||window.outerWidth===window.screen.width&&window.outerHeight===window.screen.height},calcInitialHeight:function(){var e=window.innerHeight-15;return e-=this.isFullscreen()?64:151},calcHeight:function(){var e=this.isFullscreen(),i=window.innerHeight-15;return document.body.classList.toggle("paintShop-is-fullscreen",e),i-=e?t(".hd").outerHeight(!0)+30:t(".hd").outerHeight(!0)+t(".ft").outerHeight(!0)},toggleFullscreen:function(){this.options.fullscreen=!this.options.fullscreen,this.broker.publish("router.navigate",{url:this.genClientUrl(),replace:!0,trigger:!1}),this.resize()},renderTabs:function(){var e="";this.serializeTabs().forEach(function(t){e+='<div class="paintShop-tab '+(t.active?"is-active":"")+'" data-mrp="'+t.mrp+'">'+t.label+"</div>"}),e+='<div class="paintShop-tab"></div>',this.$id("tabs").html(e)},handleDragEvent:function(e){e.preventDefault(),e.stopPropagation()},onDrop:function(t){if(t=t.originalEvent,t.preventDefault(),t.stopPropagation(),!t.dataTransfer.files.length)return n.msg.show({type:"warning",time:3e3,text:i("paintShop","msg:filesOnly")});var r=e.find(t.dataTransfer.files,function(e){return/vnd.ms-excel.sheet|spreadsheetml.sheet/.test(e.type)&&/\.xls[xm]$/.test(e.name)});if(!r)return n.msg.show({type:"warning",time:3e3,text:i("paintShop","msg:invalidFile")});n.msg.loading();var o=new FormData;o.append("queue",r);var a=this,d=a.ajax({type:"POST",url:"/paintShop/orders;import",data:o,processData:!1,contentType:!1});d.fail(function(){n.msg.loadingFailed()}),d.done(function(e){n.msg.loaded(),a.orders.setDateFilter(s.utc.format(e.date,"YYYY-MM-DD")),a.promised(a.orders.fetch({reset:!0}))})},genClientUrl:function(){return this.orders.genClientUrl()+(this.options.fullscreen?"?fullscreen=1":"")},onOrdersReset:function(){var e=this;e.layout&&e.layout.setBreadcrumbs(e.breadcrumbs,e),e.broker.publish("router.navigate",{url:this.genClientUrl(),trigger:!1,replace:!0}),this.renderTabs()},onBreadcrumbsClick:function(e){function i(e){""===e&&(e=a(Date.now()).moment.format("YYYY-MM-DD"));var t=s.getMoment(e,"YYYY-MM-DD");d.remove(),t.isValid()&&e!==o?(r.orders.setDateFilter(e),r.orders.fetch({reset:!0})):e=o,n.innerHTML='<a href="#paintShop/'+e+'">'+s.getMoment(e,"YYYY-MM-DD").format("L")+"</a>"}if("A"===e.target.tagName){if(f)return this.showDatePickerDialog(),!1;var n=e.target.parentNode;n.innerHTML="";var r=this,o=r.orders.getDateFilter("YYYY-MM-DD"),d=t('<input type="date" class="form-control paintShop-dateBreadcrumb">').val(o).appendTo(n).focus().on("keyup",function(e){return 13===e.keyCode?(i(d.val()),!1):27===e.keyCode?(i(null),!1):void 0}).on("blur",function(){i(d.val())});return!1}},showDatePickerDialog:function(){var e=new l({model:{date:this.orders.getDateFilter()},vkb:this.vkbView});this.listenTo(e,"picked",function(e){n.closeDialog(),e!==this.orders.getDateFilter()&&(this.orders.setDateFilter(e),this.orders.fetch({reset:!0}))}),n.showDialog(e)},startActionTimer:function(e,t){this.actionTimer.action=e,this.actionTimer.time=Date.now(),t&&t.preventDefault()},stopActionTimer:function(e){if(this.actionTimer.action===e){var t=Date.now()-this.actionTimer.time>3e3;"switchApps"===e?t?window.parent.postMessage({type:"config"},"*"):window.parent.postMessage({type:"switch",app:"mrl"},"*"):"reboot"===e?t?window.parent.postMessage({type:"reboot"},"*"):window.parent.postMessage({type:"refresh"},"*"):t&&"shutdown"===e&&window.parent.postMessage({type:"shutdown"},"*"),this.actionTimer.action=null,this.actionTimer.time=null}}})});