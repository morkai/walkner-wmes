// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/util/bindLoadingMessage","app/core/util/getShiftStartInfo","app/core/util/html2pdf","app/data/clipboard","app/production/views/VkbView","app/printers/views/PrinterPickerView","app/planning/util/contextMenu","app/paintShopPaints/PaintShopPaintCollection","../PaintShopOrder","../PaintShopOrderCollection","../PaintShopDropZoneCollection","../views/PaintShopQueueView","../views/PaintShopListView","../views/PaintShopDatePickerView","app/paintShop/templates/page","app/paintShop/templates/mrpTabs","app/paintShop/templates/totals","app/paintShop/templates/printPage"],function(t,e,i,s,o,n,r,a,d,p,h,l,c,u,f,m,w,g,b,S,v,T,A,y,k){"use strict";var V="/"===window.location.pathname?"paintShop":"ps-queue",C=window.parent!==window||"/"!==window.location.pathname,D={started:1,partial:2,finished:3};return r.extend({template:T,layoutName:"page",pageId:"paintShop",breadcrumbs:function(){return[i.bound("paintShop","BREADCRUMBS:base"),{href:"#paintShop/"+this.orders.getDateFilter(),label:this.orders.getDateFilter("L"),template:function(t){return'<span class="paintShop-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a><a href="'+t.href+'" data-action="showPicker">'+t.label+'</a><a class="fa fa-chevron-right" data-action="next"></a></span>'}}]},actions:function(){var t=this,e=[];return C||e.push({type:"link",icon:"arrows-alt",callback:this.toggleFullscreen.bind(t)},{icon:"balance-scale",href:"#paintShop/load",privileges:"PAINT_SHOP:VIEW",label:i("paintShop","PAGE_ACTIONS:load"),callback:function(){window.WMES_LAST_PAINT_SHOP_DATE=t.orders.getDateFilter()}},{icon:"paint-brush",href:"#paintShop/paints",privileges:"PAINT_SHOP:MANAGE",label:i("paintShop","PAGE_ACTIONS:paints"),callback:function(){window.WMES_LAST_PAINT_SHOP_DATE=t.orders.getDateFilter()}},{href:"#paintShop;settings?tab=planning",icon:"cogs",label:i.bound("paintShop","PAGE_ACTIONS:settings"),privileges:"PAINT_SHOP:MANAGE"}),e},localTopics:{"socket.connected":function(){this.$el.removeClass("paintShop-is-disconnected")},"socket.disconnected":function(){this.$el.addClass("paintShop-is-disconnected")}},remoteTopics:{"paintShop.orders.changed.*":function(t){var e=this.orders.getDateFilter();s.utc.format(t.date,"YYYY-MM-DD")===e&&this.orders.applyChanges(t.changes)},"paintShop.orders.updated.*":function(t){var e=this.orders.get(t._id);e&&(e.set(m.parse(t)),(t.qtyPaint||t.status)&&this.orders.recountTotals())},"paintShop.dropZones.updated.*":function(t){this.dropZones.updated(t)},"paintShop.paints.added":function(t){this.paints.add(t.model)},"paintShop.paints.edited":function(t){var e=this.paints.get(t.model._id);e&&e.set(t.model)},"paintShop.paints.deleted":function(t){this.paints.remove(t.model._id)}},events:{"click .paintShop-tab[data-mrp]":function(t){this.orders.selectMrp(t.currentTarget.dataset.mrp)},"contextmenu .paintShop-tab":function(t){return this.showMrpMenu(t),!1},"focus #-search":function(t){this.vkbView&&(clearTimeout(this.timers.hideVkb),this.vkbView.show(t.target,this.onVkbValueChange),this.vkbView.$el.css({left:"195px",bottom:"67px",marginLeft:"0"}))},"blur #-search":function(){this.vkbView&&this.scheduleHideVkb()},"input #-search":"onVkbValueChange","mousedown #-switchApps":function(t){this.startActionTimer("switchApps",t)},"touchstart #-switchApps":function(){this.startActionTimer("switchApps")},"mouseup #-switchApps":function(){this.stopActionTimer("switchApps")},"touchend #-switchApps":function(){this.stopActionTimer("switchApps")},"mousedown #-reboot":function(t){this.startActionTimer("reboot",t)},"touchstart #-reboot":function(){this.startActionTimer("reboot")},"mouseup #-reboot":function(){this.stopActionTimer("reboot")},"touchend #-reboot":function(){this.stopActionTimer("reboot")},"mousedown #-shutdown":function(t){this.startActionTimer("shutdown",t)},"touchstart #-shutdown":function(){this.startActionTimer("shutdown")},"mouseup #-shutdown":function(){this.stopActionTimer("shutdown")},"touchend #-shutdown":function(){this.stopActionTimer("shutdown")}},initialize:function(){this.onResize=t.debounce(this.resize.bind(this),30),this.onVkbValueChange=this.onVkbValueChange.bind(this),this.actionTimer={action:null,time:null},this.defineModels(),this.defineViews(),this.defineBindings(),this.setView("#-queue",this.queueView),this.setView("#-todo",this.todoView),this.setView("#-done",this.doneView),C&&this.setView("#-vkb",this.vkbView)},setUpLayout:function(t){this.layout=t},destroy:function(){this.hideMenu(),e(".modal").addClass("fade"),e(document.body).css("overflow","").removeClass("paintShop-is-fullscreen paintShop-is-embedded"),e(window).off("."+this.idPrefix),e(document).off("."+this.idPrefix)},defineModels:function(){this.paints=a(new f(null,{rqlQuery:"limit(0)"}),this,"MSG:LOADING_FAILURE:paints"),this.orders=a(w.forDate(this.options.date,{selectedMrp:this.options.selectedMrp||"all",paints:this.paints}),this),this.dropZones=a(g.forDate(this.options.date),this,"MSG:LOADING_FAILURE:dropZones")},defineViews:function(){this.vkbView=C?new l:null,this.queueView=new b({orders:this.orders,dropZones:this.dropZones,vkb:this.vkbView}),this.todoView=new S({model:this.orders,showTimes:!1,showSearch:!0,showTotals:!1,vkb:this.vkbView,filter:function(t){return"new"===t.status||"cancelled"===t.status}}),this.doneView=new S({model:this.orders,showTimes:!0,showSearch:!1,showTotals:!0,filter:function(t){return D[t.status]>=1},sort:function(t,e){return"started"===t.status&&"started"===e.status||"partial"===t.status&&"partial"===e.status?t.startedAt-e.startedAt:t.status!==e.status?D[t.status]-D[e.status]:e.startedAt-t.startedAt}})},defineBindings:function(){var i=this,s=i.idPrefix;i.listenTo(i.orders,"reset",t.after(2,this.onOrdersReset)),i.listenTo(i.orders,"mrpSelected",this.onMrpSelected),i.listenTo(i.orders,"totalsRecounted",this.renderTotals),i.listenTo(i.dropZones,"reset",t.after(2,this.renderTabs)),i.listenTo(i.dropZones,"updated",this.onDropZoneUpdated),i.listenTo(i.paints,"add change remove",this.onPaintUpdated),i.listenTo(i.queueView,"actionRequested",this.onActionRequested),e(document).on("click."+s,".paintShop-breadcrumb",this.onBreadcrumbsClick.bind(this)),e(window).on("resize."+s,this.onResize),i.once("afterRender",function(){C&&window.parent.postMessage({type:"ready",app:V},"*"),i.onOrdersReset()})},load:function(t){return t(this.orders.fetch({reset:!0}),this.dropZones.fetch({reset:!0}),this.paints.fetch({reset:!0}))},serialize:function(){return{idPrefix:this.idPrefix,embedded:C,height:this.calcInitialHeight()+"px",renderTabs:A,renderTotals:y,tabs:this.serializeTabs(),totals:this.serializeTotals()}},serializeTabs:function(){var t=this.orders,e=this.dropZones;return(t.allMrps||[]).map(function(i){return{mrp:i,label:i,active:t.selectedMrp===i,dropZone:e.getState(i)}})},serializeTotals:function(){return this.orders.totalQuantities[this.orders.selectedMrp]},beforeRender:function(){document.body.style.overflow="hidden",document.body.classList.toggle("paintShop-is-fullscreen",this.isFullscreen()),document.body.classList.toggle("paintShop-is-embedded",C)},afterRender:function(){this.$id("todo").on("scroll",this.todoView.onScroll.bind(this.todoView)),this.$id("queue").on("scroll",this.queueView.onScroll.bind(this.queueView)),this.$id("done").on("scroll",this.doneView.onScroll.bind(this.doneView)),e(".modal.fade").removeClass("fade"),this.resize()},resize:function(){this.el.style.height=this.calcHeight()+"px"},isFullscreen:function(){return C||this.options.fullscreen||window.innerWidth<=800||window.outerWidth===window.screen.width&&window.outerHeight===window.screen.height},calcInitialHeight:function(){var t=window.innerHeight-15;return this.isFullscreen()?t-=64:t-=151,t},calcHeight:function(){var t=this.isFullscreen(),i=window.innerHeight-15;return document.body.classList.toggle("paintShop-is-fullscreen",t),i-=t?e(".hd").outerHeight(!0)+30:e(".hd").outerHeight(!0)+e(".ft").outerHeight(!0)},toggleFullscreen:function(){this.options.fullscreen=!this.options.fullscreen,this.updateUrl(),this.resize()},renderTabs:function(){this.$id("tabs").html(A({tabs:this.serializeTabs()}))},renderTotals:function(){this.$id("totals").html(y({totals:this.serializeTotals()}))},updateUrl:function(){C||this.broker.publish("router.navigate",{url:this.genClientUrl(),trigger:!1,replace:!0})},genClientUrl:function(){var t=[];return"all"!==this.orders.selectedMrp&&t.push("mrp="+this.orders.selectedMrp),this.options.fullscreen&&t.push("fullscreen=1"),this.orders.genClientUrl()+(t.length?"?":"")+t.join("&")},showMrpMenu:function(t){var e=t.currentTarget.dataset.mrp,s=[i("paintShop","menu:header:"+(e?"mrp":"all"),{mrp:e}),{icon:"fa-clipboard",label:i("paintShop","menu:copyOrders"),handler:this.handleCopyOrdersAction.bind(this,t,e)},{icon:"fa-clipboard",label:i("paintShop","menu:copyChildOrders"),handler:this.handleCopyChildOrdersAction.bind(this,t,e)},{icon:"fa-print",label:i("paintShop","menu:printOrders"),handler:this.handlePrintOrdersAction.bind(this,"mrp",e)},{icon:"fa-download",label:i("paintShop","menu:exportOrders"),handler:this.handleExportOrdersAction.bind(this,e)}];e&&o.isAllowedTo("PAINT_SHOP:DROP_ZONES")&&s.push({icon:"fa-level-down",label:i("paintShop","menu:dropZone:"+this.dropZones.getState(e)),handler:this.handleDropZoneAction.bind(this,e)}),u.show(this,t.pageY,t.pageX,s)},hideMenu:function(){u.hide(this)},handleCopyOrdersAction:function(t,e){var s=this,o=t.currentTarget,n=t.pageX,r=t.pageY;h.copy(function(t){if(t){var a=[],d={};s.orders.forEach(function(t){if(!e||t.get("mrp")===e){var i=t.get("order");d[i]||(a.push(i),d[i]=!0)}}),t.setData("text/plain",a.join("\r\n")),h.showTooltip(s,o,n,r,{title:i("paintShop","menu:copyOrders:success")})}})},handleCopyChildOrdersAction:function(t,e){var s=this,o=t.currentTarget,n=t.pageX,r=t.pageY;h.copy(function(t){if(t){var a=[];s.orders.forEach(function(t){e&&t.get("mrp")!==e||t.get("childOrders").forEach(function(t){a.push(t.order)})}),t.setData("text/plain",a.join("\r\n")),h.showTooltip(s,o,n,r,{title:i("paintShop","menu:copyChildOrders:success")})}})},handlePrintOrdersAction:function(t,e,i){var s=this;i.contextMenu.tag="paintShop",c.contextMenu(i,function(i){var o=s.orders.filter(function(i){return!e||i.get(t)===e});if(o.length){var n=k({date:+s.orders.getDateFilter("x"),mrp:e?"order"===t?o[0].get("mrp"):e:null,orderNo:"order"===t?e:null,pages:s.serializePrintPages(o)});p(n,i)}})},handleExportOrdersAction:function(t){window.location.href="/paintShop/orders;export.xlsx?sort(date,no)&limit(0)&date="+this.orders.getDateFilter()+(t?"&mrp="+t:"")},handleDropZoneAction:function(t){var e=this,s=e.$('.paintShop-tab[data-mrp="'+t+'"]').addClass("is-loading"),o=s.find(".fa").removeClass("fa-level-down").addClass("fa-spinner fa-spin"),r=e.promised(e.dropZones.toggle(t));r.fail(function(){s.toggleClass("is-dropped",e.dropZones.getState(t)),n.msg.show({type:"error",time:2500,text:i("paintShop","menu:dropZone:failure")})}),r.done(function(t){s.toggleClass("is-dropped",t.state)}),r.always(function(){o.removeClass("fa-spinner fa-spin").addClass("fa-level-down"),s.removeClass("is-loading")}),this.dropZones.updated({_id:{date:this.dropZones.date,mrp:t},state:!this.dropZones.getState(t)})},serializePrintPages:function(t){var e=[{rows:[]}],i=function(t){var i=e[e.length-1];44===i.rows.length?e.push({rows:[t]}):i.rows.push(t)};return t.forEach(function(t){i({type:"order",no:t.get("no")+".",order:t.get("order"),nc12:t.get("nc12"),qty:t.get("qty"),unit:"PCE",name:t.get("name"),mrp:t.get("mrp")}),t.get("childOrders").forEach(function(t){i({type:"childOrder",no:"",order:t.order,nc12:t.nc12,qty:t.qty,unit:"PCE",name:t.name,mrp:""}),t.components.forEach(function(t){m.isComponentBlacklisted(t)||i({type:"component",no:"",order:"",nc12:t.nc12,qty:Math.ceil(t.qty),unit:t.unit,name:t.name,mrp:""})})})}),e},scheduleHideVkb:function(){var t=this;clearTimeout(t.timers.hideVkb),t.vkbView.isVisible()&&(t.timers.hideVkb=setTimeout(function(){t.vkbView.hide(),t.vkbView.$el.css({left:"",bottom:"",marginLeft:""}),t.$id("search").val("").addClass("is-empty").css("background","")},250))},searchOrder:function(t){function e(){n.msg.show({type:"warning",time:2500,text:i("paintShop","MSG:search:failure")}),o("#f2dede")}function o(t){a.css("background",t),setTimeout(function(){a.prop("disabled",!1).val("").addClass("is-empty").css("background","").focus()},1337)}var r=this;r.vkbView&&r.vkbView.hide();var a=r.$id("search").blur(),d=r.orders.getFirstByOrderNo(t);if(d)return a.val("").addClass("is-empty").css("background",""),d.get("mrp")!==r.orders.selectedMrp&&r.orders.selectMrp(d.get("mrp")),void r.orders.trigger("focus",d.id,{showDetails:!0});a.prop("disabled",!0),n.msg.loading();var p=this.ajax({url:"/paintShop/orders?select(date,mrp)&limit(1)&or(eq(order,string:"+t+"),eq(childOrders.order,string:"+t+"))"});p.fail(e),p.done(function(t){if(0===t.totalCount)return e();var i=t.collection[0];r.orders.setDateFilter(s.utc.format(i.date,"YYYY-MM-DD"));var n=r.orders.fetch({reset:!0});n.fail(e),n.done(function(){r.orders.selectedMrp!==i.mrp&&r.orders.selectMrp(i.mrp),r.orders.trigger("focus",i._id,{showDetails:!0}),o("#ddffdd")})}),p.always(function(){n.msg.loaded()})},onVkbValueChange:function(){var t=this.$id("search"),e=t.val();t.toggleClass("is-empty",""===e).css("background",/[^0-9]+/.test(e)?"#f2dede":""),/^[0-9]{9}$/.test(e)&&this.searchOrder(e)},onActionRequested:function(t){switch(t){case"copyOrders":t=this.handleCopyOrdersAction;break;case"copyChildOrders":t=this.handleCopyChildOrdersAction;break;case"dropZone":t=this.handleDropZoneAction;break;case"printOrders":t=this.handlePrintOrdersAction;break;case"exportOrders":t=this.handleExportOrdersAction;break;default:return}t.apply(this,Array.prototype.splice.call(arguments,1))},onOrdersReset:function(){var t=this;t.layout&&t.layout.setBreadcrumbs(t.breadcrumbs,t),this.updateUrl(),this.renderTabs(),this.renderTotals()},onMrpSelected:function(){this.updateUrl(),this.renderTotals(),this.$(".paintShop-tab.is-active").removeClass("is-active"),"all"!==this.orders.selectedMrp&&this.$('.paintShop-tab[data-mrp="'+this.orders.selectedMrp+'"]').addClass("is-active")},onDropZoneUpdated:function(t){this.$('.paintShop-tab[data-mrp="'+t.get("mrp")+'"]').toggleClass("is-dropped",t.get("state"))},onPaintUpdated:function(){this.orders.serialize(!0),this.orders.trigger("reset")},onBreadcrumbsClick:function(t){if("A"===t.target.tagName)return!t.target.classList.contains("disabled")&&("showPicker"===t.target.dataset.action?this.showDatePickerDialog():this.selectNonEmptyDate(t.target.dataset.action),!1)},setDate:function(t){this.orders.setDateFilter(t),this.dropZones.setDate(this.orders.getDateFilter()),this.promised(this.orders.fetch({reset:!0})),this.promised(this.dropZones.fetch({reset:!0}))},showDatePickerDialog:function(){var t=new v({model:{date:this.orders.getDateFilter()},vkb:this.vkbView});this.listenTo(t,"picked",function(t){n.closeDialog(),t!==this.orders.getDateFilter()&&this.setDate(t)}),n.showDialog(t)},selectNonEmptyDate:function(t){e(".paintShop-breadcrumb").find("a").addClass("disabled");var o=this,r=+o.orders.getDateFilter("x"),a="/paintShop/orders?limit(1)&select(date)";a+="prev"===t?"&sort(-date)&date<"+r+"&date>"+(r-2592e6):"&sort(date)&date>"+r+"&date<"+(r+2592e6);var d=o.ajax({url:a});d.done(function(t){t.totalCount?o.setDate(s.utc.format(t.collection[0].date,"YYYY-MM-DD")):n.msg.show({type:"warning",time:2500,text:i("paintShop","MSG:date:empty")})}),d.fail(function(){n.msg.show({type:"error",time:2500,text:i("paintShop","MSG:date:failure")})}),d.always(function(){o.layout&&o.layout.setBreadcrumbs(o.breadcrumbs,o)})},startActionTimer:function(t,e){this.actionTimer.action=t,this.actionTimer.time=Date.now(),e&&e.preventDefault()},stopActionTimer:function(t){if(this.actionTimer.action===t){var e=Date.now()-this.actionTimer.time>3e3;"switchApps"===t?e?window.parent.postMessage({type:"config"},"*"):window.parent.postMessage({type:"switch",app:V},"*"):"reboot"===t?e?window.parent.postMessage({type:"reboot"},"*"):window.parent.postMessage({type:"refresh"},"*"):e&&"shutdown"===t&&window.parent.postMessage({type:"shutdown"},"*"),this.actionTimer.action=null,this.actionTimer.time=null}}})});