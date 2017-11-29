// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/util/bindLoadingMessage","app/core/util/getShiftStartInfo","app/core/util/html2pdf","app/data/clipboard","app/production/views/VkbView","app/planning/util/contextMenu","../PaintShopOrder","../PaintShopOrderCollection","../PaintShopDropZoneCollection","../views/PaintShopQueueView","../views/PaintShopListView","../views/PaintShopDatePickerView","app/paintShop/templates/page","app/paintShop/templates/mrpTabs","app/paintShop/templates/totals","app/paintShop/templates/printPage"],function(e,t,i,s,o,r,n,a,d,h,c,p,l,u,f,m,g,w,b,v,S,y,T){"use strict";var k=window.parent!==window,V={started:1,partial:2,finished:3};return n.extend({template:v,layoutName:"page",pageId:"paintShop",breadcrumbs:function(){return[i.bound("paintShop","BREADCRUMBS:base"),i.bound("paintShop","BREADCRUMBS:queue"),{href:"#paintShop/"+this.orders.getDateFilter(),label:this.orders.getDateFilter("L"),template:function(e){return'<span class="paintShop-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a><a href="'+e.href+'" data-action="showPicker">'+e.label+'</a><a class="fa fa-chevron-right" data-action="next"></a></span>'}}]},actions:function(){var e=[];return k||e.push({type:"link",icon:"arrows-alt",callback:this.toggleFullscreen.bind(this)}),e},localTopics:{"socket.connected":function(){this.$el.removeClass("paintShop-is-disconnected")},"socket.disconnected":function(){this.$el.addClass("paintShop-is-disconnected")}},remoteTopics:{"paintShop.orders.changed.*":function(e){var t=this.orders.getDateFilter(),i=s.utc.format(e.date,"YYYY-MM-DD");i===t&&this.orders.applyChanges(e.changes)},"paintShop.orders.updated.*":function(e){var t=this.orders.get(e._id);t&&(t.set(u.parse(e)),(e.qtyPaint||e.status)&&this.orders.recountTotals())},"paintShop.dropZones.updated.*":function(e){this.dropZones.updated(e)}},events:{"click .paintShop-tab[data-mrp]":function(e){this.orders.selectMrp(e.currentTarget.dataset.mrp)},"contextmenu .paintShop-tab":function(e){return this.showMrpMenu(e),!1},"focus #-search":function(e){this.vkbView&&(clearTimeout(this.timers.hideVkb),this.vkbView.show(e.target,this.onVkbValueChange),this.vkbView.$el.css({left:"195px",bottom:"67px",marginLeft:"0"}))},"blur #-search":function(){this.vkbView&&this.scheduleHideVkb()},"input #-search":"onVkbValueChange","mousedown #-switchApps":function(e){this.startActionTimer("switchApps",e)},"touchstart #-switchApps":function(){this.startActionTimer("switchApps")},"mouseup #-switchApps":function(){this.stopActionTimer("switchApps")},"touchend #-switchApps":function(){this.stopActionTimer("switchApps")},"mousedown #-reboot":function(e){this.startActionTimer("reboot",e)},"touchstart #-reboot":function(){this.startActionTimer("reboot")},"mouseup #-reboot":function(){this.stopActionTimer("reboot")},"touchend #-reboot":function(){this.stopActionTimer("reboot")},"mousedown #-shutdown":function(e){this.startActionTimer("shutdown",e)},"touchstart #-shutdown":function(){this.startActionTimer("shutdown")},"mouseup #-shutdown":function(){this.stopActionTimer("shutdown")},"touchend #-shutdown":function(){this.stopActionTimer("shutdown")}},initialize:function(){this.onResize=e.debounce(this.resize.bind(this),30),this.onVkbValueChange=this.onVkbValueChange.bind(this),this.actionTimer={action:null,time:null},this.defineModels(),this.defineViews(),this.defineBindings(),this.setView("#-queue",this.queueView),this.setView("#-todo",this.todoView),this.setView("#-done",this.doneView),k&&this.setView("#-vkb",this.vkbView)},setUpLayout:function(e){this.layout=e},destroy:function(){this.hideMenu(),t(".modal").addClass("fade"),t(document.body).css("overflow","").removeClass("paintShop-is-fullscreen paintShop-is-embedded"),t(window).off("."+this.idPrefix),t(document).off("."+this.idPrefix)},defineModels:function(){this.orders=e.assign(a(f.forDate(this.options.date),this),{selectedMrp:this.options.selectedMrp||"all"}),this.dropZones=a(m.forDate(this.options.date),this,"MSG:LOADING_FAILURE:dropZones")},defineViews:function(){this.vkbView=k?new p:null,this.queueView=new g({orders:this.orders,dropZones:this.dropZones,vkb:this.vkbView}),this.todoView=new w({model:this.orders,showTimes:!1,showSearch:!0,showTotals:!1,vkb:this.vkbView,filter:function(e){return"new"===e.status||"cancelled"===e.status}}),this.doneView=new w({model:this.orders,showTimes:!0,showSearch:!1,showTotals:!0,filter:function(e){return V[e.status]>=1},sort:function(e,t){return"started"===e.status&&"started"===t.status||"partial"===e.status&&"partial"===t.status?e.startedAt-t.startedAt:e.status!==t.status?V[e.status]-V[t.status]:t.startedAt-e.startedAt}})},defineBindings:function(){var e=this,i=e.idPrefix;e.listenTo(e.orders,"reset",this.onOrdersReset),e.listenTo(e.orders,"mrpSelected",this.onMrpSelected),e.listenTo(e.orders,"totalsRecounted",this.renderTotals),e.listenTo(e.dropZones,"reset",this.renderTabs),e.listenTo(e.dropZones,"updated",this.onDropZoneUpdated),e.listenTo(e.queueView,"actionRequested",this.onActionRequested),t(document).on("click."+i,".paintShop-breadcrumb",this.onBreadcrumbsClick.bind(this)),t(window).on("resize."+i,this.onResize),k&&e.once("afterRender",function(){window.parent.postMessage({type:"ready",app:"paintShop"},"*")})},load:function(e){return e(this.orders.fetch({reset:!0}),this.dropZones.fetch({reset:!0}))},serialize:function(){return{idPrefix:this.idPrefix,embedded:k,height:this.calcInitialHeight()+"px",renderTabs:S,renderTotals:y,tabs:this.serializeTabs(),totals:this.serializeTotals()}},serializeTabs:function(){var e=this.orders,t=this.dropZones;return(e.allMrps||[]).map(function(i){return{mrp:i,label:i,active:e.selectedMrp===i,dropZone:t.getState(i)}})},serializeTotals:function(){return this.orders.totalQuantities[this.orders.selectedMrp]},beforeRender:function(){document.body.style.overflow="hidden",document.body.classList.toggle("paintShop-is-fullscreen",this.isFullscreen()),document.body.classList.toggle("paintShop-is-embedded",k)},afterRender:function(){this.$id("todo").on("scroll",this.todoView.onScroll.bind(this.todoView)),this.$id("queue").on("scroll",this.queueView.onScroll.bind(this.queueView)),this.$id("done").on("scroll",this.doneView.onScroll.bind(this.doneView)),t(".modal.fade").removeClass("fade"),this.resize()},resize:function(){this.el.style.height=this.calcHeight()+"px"},isFullscreen:function(){return k||this.options.fullscreen||window.innerWidth<=800||window.outerWidth===window.screen.width&&window.outerHeight===window.screen.height},calcInitialHeight:function(){var e=window.innerHeight-15;return e-=this.isFullscreen()?64:151},calcHeight:function(){var e=this.isFullscreen(),i=window.innerHeight-15;return document.body.classList.toggle("paintShop-is-fullscreen",e),i-=e?t(".hd").outerHeight(!0)+30:t(".hd").outerHeight(!0)+t(".ft").outerHeight(!0)},toggleFullscreen:function(){this.options.fullscreen=!this.options.fullscreen,this.updateUrl(),this.resize()},renderTabs:function(){this.$id("tabs").html(S({tabs:this.serializeTabs()}))},renderTotals:function(){this.$id("totals").html(y({totals:this.serializeTotals()}))},updateUrl:function(){this.broker.publish("router.navigate",{url:this.genClientUrl(),replace:!0,trigger:!1})},genClientUrl:function(){var e=[];return"all"!==this.orders.selectedMrp&&e.push("mrp="+this.orders.selectedMrp),this.options.fullscreen&&e.push("fullscreen=1"),this.orders.genClientUrl()+(e.length?"?":"")+e.join("&")},showMrpMenu:function(e){var t=e.currentTarget.dataset.mrp,s=[i("paintShop","menu:header:"+(t?"mrp":"all"),{mrp:t}),{icon:"fa-clipboard",label:i("paintShop","menu:copyOrders"),handler:this.handleCopyOrdersAction.bind(this,e,t)},{icon:"fa-clipboard",label:i("paintShop","menu:copyChildOrders"),handler:this.handleCopyChildOrdersAction.bind(this,e,t)},{icon:"fa-print",label:i("paintShop","menu:printOrders"),handler:this.handlePrintOrdersAction.bind(this,"mrp",t)},{icon:"fa-download",label:i("paintShop","menu:exportOrders"),handler:this.handleExportOrdersAction.bind(this,t)}];t&&o.isAllowedTo("PAINT_SHOP:DROP_ZONES")&&s.push({icon:"fa-level-down",label:i("paintShop","menu:dropZone:"+this.dropZones.getState(t)),handler:this.handleDropZoneAction.bind(this,t)}),l.show(this,e.pageY,e.pageX,s)},hideMenu:function(){l.hide(this)},handleCopyOrdersAction:function(e,t){var s=this,o=e.currentTarget,r=e.pageX,n=e.pageY;c.copy(function(e){if(e){var a=[],d={};s.orders.forEach(function(e){if(!t||e.get("mrp")===t){var i=e.get("order");d[i]||(a.push(i),d[i]=!0)}}),e.setData("text/plain",a.join("\r\n")),c.showTooltip(s,o,r,n,{title:i("paintShop","menu:copyOrders:success")})}})},handleCopyChildOrdersAction:function(e,t){var s=this,o=e.currentTarget,r=e.pageX,n=e.pageY;c.copy(function(e){if(e){var a=[];s.orders.forEach(function(e){t&&e.get("mrp")!==t||e.get("childOrders").forEach(function(e){a.push(e.order)})}),e.setData("text/plain",a.join("\r\n")),c.showTooltip(s,o,r,n,{title:i("paintShop","menu:copyChildOrders:success")})}})},handlePrintOrdersAction:function(e,t){var i=this.orders.filter(function(i){return!t||i.get(e)===t});i.length&&h(T({date:+this.orders.getDateFilter("x"),mrp:t?"order"===e?i[0].get("mrp"):t:null,orderNo:"order"===e?t:null,pages:this.serializePrintPages(i)}))},handleExportOrdersAction:function(e){window.location.href="/paintShop/orders;export.xlsx?sort(date,no)&limit(0)&date="+this.orders.getDateFilter()+(e?"&mrp="+e:"")},handleDropZoneAction:function(e){var t=this,s=t.$('.paintShop-tab[data-mrp="'+e+'"]').addClass("is-loading"),o=s.find(".fa").removeClass("fa-level-down").addClass("fa-spinner fa-spin"),n=t.promised(t.dropZones.toggle(e));n.fail(function(){s.toggleClass("is-dropped",t.dropZones.getState(e)),r.msg.show({type:"error",time:2500,text:i("paintShop","menu:dropZone:failure")})}),n.done(function(e){s.toggleClass("is-dropped",e.state)}),n.always(function(){o.removeClass("fa-spinner fa-spin").addClass("fa-level-down"),s.removeClass("is-loading")}),this.dropZones.updated({_id:{date:this.dropZones.date,mrp:e},state:!this.dropZones.getState(e)})},serializePrintPages:function(e){var t=[{rows:[]}],i=function(e){var i=t[t.length-1];44===i.rows.length?t.push({rows:[e]}):i.rows.push(e)};return e.forEach(function(e){i({type:"order",no:e.get("no")+".",order:e.get("order"),nc12:e.get("nc12"),qty:e.get("qty"),unit:"PCE",name:e.get("name"),mrp:e.get("mrp")}),e.get("childOrders").forEach(function(e){i({type:"childOrder",no:"",order:e.order,nc12:e.nc12,qty:e.qty,unit:"PCE",name:e.name,mrp:""}),e.components.forEach(function(e){u.isComponentBlacklisted(e)||i({type:"component",no:"",order:"",nc12:e.nc12,qty:Math.ceil(e.qty),unit:e.unit,name:e.name,mrp:""})})})}),t},scheduleHideVkb:function(){var e=this;clearTimeout(e.timers.hideVkb),e.vkbView.isVisible()&&(e.timers.hideVkb=setTimeout(function(){e.vkbView.hide(),e.vkbView.$el.css({left:"",bottom:"",marginLeft:""}),e.$id("search").val("").addClass("is-empty").css("background","")},250))},searchOrder:function(e){function t(){r.msg.show({type:"warning",time:2500,text:i("paintShop","MSG:search:failure")}),o("#f2dede")}function o(e){a.css("background",e),setTimeout(function(){a.prop("disabled",!1).val("").addClass("is-empty").css("background","").focus()},1337)}var n=this;n.vkbView&&n.vkbView.hide();var a=n.$id("search").blur(),d=n.orders.getFirstByOrderNo(e);if(d)return a.val("").addClass("is-empty").css("background",""),d.get("mrp")!==n.orders.selectedMrp&&n.orders.selectMrp(d.get("mrp")),void n.orders.trigger("focus",d.id,{showDetails:!0});a.prop("disabled",!0),r.msg.loading();var h=this.ajax({url:"/paintShop/orders?select(date,mrp)&limit(1)&or(eq(order,string:"+e+"),eq(childOrders.order,string:"+e+"))"});h.fail(t),h.done(function(e){if(0===e.totalCount)return t();var i=e.collection[0];n.orders.setDateFilter(s.utc.format(i.date,"YYYY-MM-DD"));var r=n.orders.fetch({reset:!0});r.fail(t),r.done(function(){n.orders.selectedMrp!==i.mrp&&n.orders.selectMrp(i.mrp),n.orders.trigger("focus",i._id,{showDetails:!0}),o("#ddffdd")})}),h.always(function(){r.msg.loaded()})},onVkbValueChange:function(){var e=this.$id("search"),t=e.val();e.toggleClass("is-empty",""===t).css("background",/[^0-9]+/.test(t)?"#f2dede":""),/^[0-9]{9}$/.test(t)&&this.searchOrder(t)},onActionRequested:function(e){switch(e){case"copyOrders":e=this.handleCopyOrdersAction;break;case"copyChildOrders":e=this.handleCopyChildOrdersAction;break;case"dropZone":e=this.handleDropZoneAction;break;case"printOrders":e=this.handlePrintOrdersAction;break;case"exportOrders":e=this.handleExportOrdersAction;break;default:return}e.apply(this,Array.prototype.splice.call(arguments,1))},onOrdersReset:function(){var e=this;e.layout&&e.layout.setBreadcrumbs(e.breadcrumbs,e),e.broker.publish("router.navigate",{url:this.genClientUrl(),trigger:!1,replace:!0}),this.renderTabs(),this.renderTotals()},onMrpSelected:function(){this.updateUrl(),this.renderTotals(),this.$(".paintShop-tab.is-active").removeClass("is-active"),"all"!==this.orders.selectedMrp&&this.$('.paintShop-tab[data-mrp="'+this.orders.selectedMrp+'"]').addClass("is-active")},onDropZoneUpdated:function(e){this.$('.paintShop-tab[data-mrp="'+e.get("mrp")+'"]').toggleClass("is-dropped",e.get("state"))},onBreadcrumbsClick:function(e){if("A"===e.target.tagName)return!e.target.classList.contains("disabled")&&("showPicker"===e.target.dataset.action?this.showDatePickerDialog():this.selectNonEmptyDate(e.target.dataset.action),!1)},setDate:function(e){this.orders.setDateFilter(e),this.dropZones.setDate(this.orders.getDateFilter()),this.promised(this.orders.fetch({reset:!0})),this.promised(this.dropZones.fetch({reset:!0}))},showDatePickerDialog:function(){var e=new b({model:{date:this.orders.getDateFilter()},vkb:this.vkbView});this.listenTo(e,"picked",function(e){r.closeDialog(),e!==this.orders.getDateFilter()&&this.setDate(e)}),r.showDialog(e)},selectNonEmptyDate:function(e){t(".paintShop-breadcrumb").find("a").addClass("disabled");var o=this,n=+o.orders.getDateFilter("x"),a=2592e6,d="/paintShop/orders?limit(1)&select(date)";d+="prev"===e?"&sort(-date)&date<"+n+"&date>"+(n-a):"&sort(date)&date>"+n+"&date<"+(n+a);var h=o.ajax({url:d});h.done(function(e){e.collection?o.setDate(s.utc.format(e.collection[0].date,"YYYY-MM-DD")):r.msg.show({type:"warning",time:2500,text:i("paintShop","MSG:date:empty")})}),h.fail(function(){r.msg.show({type:"error",time:2500,text:i("paintShop","MSG:date:failure")})}),h.always(function(){o.layout&&o.layout.setBreadcrumbs(o.breadcrumbs,o)})},startActionTimer:function(e,t){this.actionTimer.action=e,this.actionTimer.time=Date.now(),t&&t.preventDefault()},stopActionTimer:function(e){if(this.actionTimer.action===e){var t=Date.now()-this.actionTimer.time>3e3;"switchApps"===e?t?window.parent.postMessage({type:"config"},"*"):window.parent.postMessage({type:"switch",app:"mrl"},"*"):"reboot"===e?t?window.parent.postMessage({type:"reboot"},"*"):window.parent.postMessage({type:"refresh"},"*"):t&&"shutdown"===e&&window.parent.postMessage({type:"shutdown"},"*"),this.actionTimer.action=null,this.actionTimer.time=null}}})});