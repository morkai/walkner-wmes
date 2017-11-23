// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/util/bindLoadingMessage","app/core/util/getShiftStartInfo","app/data/clipboard","app/production/views/VkbView","app/planning/util/contextMenu","../PaintShopOrder","../PaintShopOrderCollection","../PaintShopDropZoneCollection","../views/PaintShopQueueView","../views/PaintShopListView","../views/PaintShopDatePickerView","app/paintShop/templates/page","app/paintShop/templates/mrpTabs","app/paintShop/templates/printPage"],function(e,t,i,s,n,o,r,a,d,p,h,c,l,u,f,w,m,g,b,v,S){"use strict";var y=window.parent!==window,A={started:1,partial:2,finished:3};return r.extend({template:b,layoutName:"page",pageId:"paintShop",breadcrumbs:function(){return[i.bound("paintShop","BREADCRUMBS:base"),i.bound("paintShop","BREADCRUMBS:queue"),{href:"#paintShop/"+this.orders.getDateFilter(),label:this.orders.getDateFilter("L")}]},actions:function(){var e=[];return y||e.push({type:"link",icon:"arrows-alt",callback:this.toggleFullscreen.bind(this)}),e},localTopics:{"socket.connected":function(){this.$el.removeClass("paintShop-is-disconnected")},"socket.disconnected":function(){this.$el.addClass("paintShop-is-disconnected")}},remoteTopics:{"paintShop.orders.changed.*":function(e){var t=this.orders.getDateFilter(),i=s.utc.format(e.date,"YYYY-MM-DD");i===t&&this.orders.applyChanges(e.changes)},"paintShop.orders.updated.*":function(e){var t=this.orders.get(e._id);t&&t.set(l.parse(e))},"paintShop.dropZones.updated.*":function(e){this.dropZones.updated(e)}},events:{"click .paintShop-tab[data-mrp]":function(e){this.orders.selectMrp(e.currentTarget.dataset.mrp)},"contextmenu .paintShop-tab":function(e){return this.showMrpMenu(e),!1},"mousedown #-switchApps":function(e){this.startActionTimer("switchApps",e)},"touchstart #-switchApps":function(){this.startActionTimer("switchApps")},"mouseup #-switchApps":function(){this.stopActionTimer("switchApps")},"touchend #-switchApps":function(){this.stopActionTimer("switchApps")},"mousedown #-reboot":function(e){this.startActionTimer("reboot",e)},"touchstart #-reboot":function(){this.startActionTimer("reboot")},"mouseup #-reboot":function(){this.stopActionTimer("reboot")},"touchend #-reboot":function(){this.stopActionTimer("reboot")},"mousedown #-shutdown":function(e){this.startActionTimer("shutdown",e)},"touchstart #-shutdown":function(){this.startActionTimer("shutdown")},"mouseup #-shutdown":function(){this.stopActionTimer("shutdown")},"touchend #-shutdown":function(){this.stopActionTimer("shutdown")}},initialize:function(){this.onResize=e.debounce(this.resize.bind(this),30),this.actionTimer={action:null,time:null},this.defineModels(),this.defineViews(),this.defineBindings(),this.setView("#-queue",this.queueView),this.setView("#-list-all",this.allListView),this.setView("#-list-work",this.workListView),y&&this.setView("#-vkb",this.vkbView)},setUpLayout:function(e){this.layout=e},destroy:function(){this.hideMenu(),t(".modal").addClass("fade"),t(document.body).css("overflow","").removeClass("paintShop-is-fullscreen paintShop-is-embedded"),t(window).off("."+this.idPrefix),t(document).off("."+this.idPrefix)},defineModels:function(){this.orders=a(u.forDate(this.options.date),this),this.dropZones=a(f.forDate(this.options.date),this,"MSG:LOADING_FAILURE:dropZones")},defineViews:function(){this.vkbView=y?new h:null,this.queueView=new w({orders:this.orders,dropZones:this.dropZones,vkb:this.vkbView}),this.allListView=new m({model:this.orders,showTimes:!1,showSearch:!0,vkb:this.vkbView,filter:function(e){return"new"===e.status||"cancelled"===e.status}}),this.workListView=new m({model:this.orders,showTimes:!0,showSearch:!1,filter:function(e){return A[e.status]>=1},sort:function(e,t){return"started"===e.status&&"started"===t.status||"partial"===e.status&&"partial"===t.status?e.startedAt-t.startedAt:e.status!==t.status?A[e.status]-A[t.status]:t.startedAt-e.startedAt}})},defineBindings:function(){var e=this,i=e.idPrefix;e.listenTo(e.orders,"reset",this.onOrdersReset),e.listenTo(e.orders,"mrpSelected",this.onMrpSelected),e.listenTo(e.dropZones,"reset",this.renderTabs),e.listenTo(e.dropZones,"updated",this.onDropZoneUpdated),e.listenTo(e.queueView,"actionRequested",this.onActionRequested),t(document).on("click."+i,".page-breadcrumbs",this.onBreadcrumbsClick.bind(this)),t(window).on("resize."+i,this.onResize),y&&e.once("afterRender",function(){window.parent.postMessage({type:"ready",app:"paintShop"},"*")})},load:function(e){return e(this.orders.fetch({reset:!0}),this.dropZones.fetch({reset:!0}))},serialize:function(){return{idPrefix:this.idPrefix,embedded:y,height:this.calcInitialHeight()+"px",renderTabs:v,tabs:this.serializeTabs()}},serializeTabs:function(){var e=this.orders,t=this.dropZones;return(e.allMrps||[]).map(function(i){return{mrp:i,label:i,active:e.selectedMrp===i,dropZone:t.getState(i)}})},beforeRender:function(){document.body.style.overflow="hidden",document.body.classList.toggle("paintShop-is-fullscreen",this.isFullscreen()),document.body.classList.toggle("paintShop-is-embedded",y)},afterRender:function(){t(".modal.fade").removeClass("fade"),this.options.selectedMrp&&(this.$('.paintShop-tab[data-mrp="'+this.options.selectedMrp+'"]').click(),this.options.selectedMrp=null),this.resize()},resize:function(){this.el.style.height=this.calcHeight()+"px"},isFullscreen:function(){return y||this.options.fullscreen||window.innerWidth<=800||window.outerWidth===window.screen.width&&window.outerHeight===window.screen.height},calcInitialHeight:function(){var e=window.innerHeight-15;return e-=this.isFullscreen()?64:151},calcHeight:function(){var e=this.isFullscreen(),i=window.innerHeight-15;return document.body.classList.toggle("paintShop-is-fullscreen",e),i-=e?t(".hd").outerHeight(!0)+30:t(".hd").outerHeight(!0)+t(".ft").outerHeight(!0)},toggleFullscreen:function(){this.options.fullscreen=!this.options.fullscreen,this.updateUrl(),this.resize()},renderTabs:function(){this.$id("tabs").html(v({tabs:this.serializeTabs()}))},updateUrl:function(){this.broker.publish("router.navigate",{url:this.genClientUrl(),replace:!0,trigger:!1})},genClientUrl:function(){var e=[];return"all"!==this.orders.selectedMrp&&e.push("mrp="+this.orders.selectedMrp),this.options.fullscreen&&e.push("fullscreen=1"),this.orders.genClientUrl()+"?"+e.join("&")},showMrpMenu:function(e){var t=e.currentTarget.dataset.mrp,s=[i("paintShop","menu:header:"+(t?"mrp":"all"),{mrp:t}),{label:i("paintShop","menu:copyOrders"),handler:this.handleCopyOrdersAction.bind(this,e,t)},{label:i("paintShop","menu:copyChildOrders"),handler:this.handleCopyChildOrdersAction.bind(this,e,t)},{label:i("paintShop","menu:printOrders"),handler:this.handlePrintOrdersAction.bind(this,"mrp",t)}];t&&n.isAllowedTo("PAINT_SHOP:DROP_ZONES")&&s.push({label:i("paintShop","menu:dropZone:"+this.dropZones.getState(t)),handler:this.handleDropZoneAction.bind(this,t)}),c.show(this,e.pageY,e.pageX,s)},hideMenu:function(){c.hide(this)},handleCopyOrdersAction:function(e,t){var s=this,n=e.currentTarget,o=e.pageX,r=e.pageY;p.copy(function(e){if(e){var a=[],d={};s.orders.forEach(function(e){if(!t||e.get("mrp")===t){var i=e.get("order");d[i]||(a.push(i),d[i]=!0)}}),e.setData("text/plain",a.join("\r\n")),p.showTooltip(s,n,o,r,{title:i("paintShop","menu:copyOrders:success")})}})},handleCopyChildOrdersAction:function(e,t){var s=this,n=e.currentTarget,o=e.pageX,r=e.pageY;p.copy(function(e){if(e){var a=[];s.orders.forEach(function(e){t&&e.get("mrp")!==t||e.get("childOrders").forEach(function(e){a.push(e.order)})}),e.setData("text/plain",a.join("\r\n")),p.showTooltip(s,n,o,r,{title:i("paintShop","menu:copyChildOrders:success")})}})},handlePrintOrdersAction:function(e,t){var s=this.orders.filter(function(i){return!t||i.get(e)===t});if(s.length){var n=window.open("about:blank","PAINT_SHOP:PLAN_PRINT");if(!n)return o.msg.show({type:"error",time:5e3,text:i("core","MSG:POPUP_BLOCKED")});var r=S({date:+this.orders.getDateFilter("x"),mrp:t?"order"===e?s[0].get("mrp"):t:null,orderNo:"order"===e?t:null,pages:this.serializePrintPages(s),pad:function(e){return e<10?"&nbsp;"+e:e}});n.onload=function(){n.document.body.innerHTML=r},n.document.body.innerHTML=r}},handleDropZoneAction:function(e){var t=this,s=t.$('.paintShop-tab[data-mrp="'+e+'"]').addClass("is-loading"),n=s.find(".fa").removeClass("fa-level-down").addClass("fa-spinner fa-spin"),r=t.promised(t.dropZones.toggle(e));r.fail(function(){s.toggleClass("is-dropped",t.dropZones.getState(e)),o.msg.show({type:"error",time:2500,text:i("paintShop","menu:dropZone:failure")})}),r.done(function(e){s.toggleClass("is-dropped",e.state)}),r.always(function(){n.removeClass("fa-spinner fa-spin").addClass("fa-level-down"),s.removeClass("is-loading")}),this.dropZones.updated({_id:{date:this.dropZones.date,mrp:e},state:!this.dropZones.getState(e)})},serializePrintPages:function(e){var t=[{rows:[]}],i=function(e){var i=t[t.length-1];44===i.rows.length?t.push({rows:[e]}):i.rows.push(e)};return e.forEach(function(e){i({type:"order",no:e.get("no")+".",order:e.get("order"),nc12:e.get("nc12"),qty:e.get("qty"),unit:"PCE",name:e.get("name"),mrp:e.get("mrp")}),e.get("childOrders").forEach(function(e){i({type:"childOrder",no:"",order:e.order,nc12:e.nc12,qty:e.qty,unit:"PCE",name:e.name,mrp:""}),e.components.forEach(function(e){i({type:"component",no:"",order:"",nc12:e.nc12,qty:Math.ceil(e.qty),unit:e.unit,name:e.name,mrp:""})})})}),t},onActionRequested:function(e){switch(e){case"copyOrders":e=this.handleCopyOrdersAction;break;case"copyChildOrders":e=this.handleCopyChildOrdersAction;break;case"dropZone":e=this.handleDropZoneAction;break;case"printOrders":e=this.handlePrintOrdersAction;break;default:return}e.apply(this,Array.prototype.splice.call(arguments,1))},onOrdersReset:function(){var e=this;e.layout&&e.layout.setBreadcrumbs(e.breadcrumbs,e),e.broker.publish("router.navigate",{url:this.genClientUrl(),trigger:!1,replace:!0}),this.renderTabs()},onMrpSelected:function(){this.updateUrl(),this.$(".paintShop-tab.is-active").removeClass("is-active"),"all"!==this.orders.selectedMrp&&this.$('.paintShop-tab[data-mrp="'+this.orders.selectedMrp+'"]').addClass("is-active")},onDropZoneUpdated:function(e){this.$('.paintShop-tab[data-mrp="'+e.get("mrp")+'"]').toggleClass("is-dropped",e.get("state"))},onBreadcrumbsClick:function(e){if("A"===e.target.tagName)return this.showDatePickerDialog(),!1},showDatePickerDialog:function(){var e=new g({model:{date:this.orders.getDateFilter()},vkb:this.vkbView});this.listenTo(e,"picked",function(e){o.closeDialog(),e!==this.orders.getDateFilter()&&(this.orders.setDateFilter(e),this.dropZones.setDate(this.orders.getDateFilter()),this.promised(this.orders.fetch({reset:!0})),this.promised(this.dropZones.fetch({reset:!0})))}),o.showDialog(e)},startActionTimer:function(e,t){this.actionTimer.action=e,this.actionTimer.time=Date.now(),t&&t.preventDefault()},stopActionTimer:function(e){if(this.actionTimer.action===e){var t=Date.now()-this.actionTimer.time>3e3;"switchApps"===e?t?window.parent.postMessage({type:"config"},"*"):window.parent.postMessage({type:"switch",app:"mrl"},"*"):"reboot"===e?t?window.parent.postMessage({type:"reboot"},"*"):window.parent.postMessage({type:"refresh"},"*"):t&&"shutdown"===e&&window.parent.postMessage({type:"shutdown"},"*"),this.actionTimer.action=null,this.actionTimer.time=null}}})});