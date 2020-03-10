define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/util/bindLoadingMessage","app/core/util/getShiftStartInfo","app/core/util/html2pdf","app/core/util/embedded","app/core/util/pageActions","app/data/clipboard","app/production/views/VkbView","app/printers/views/PrinterPickerView","app/planning/util/contextMenu","app/wmes-drilling/DrillingOrderCollection","app/wmes-drilling/DrillingOrder","app/wh/WhOrderCollection","app/paintShopPaints/PaintShopPaintCollection","../PaintShopOrder","../PaintShopOrderCollection","../PaintShopDropZoneCollection","../PaintShopSettingCollection","../views/PaintShopQueueView","../views/PaintShopListView","../views/PaintShopDatePickerView","../views/PaintShopPaintPickerView","../views/UserPickerView","../views/PlanExecutionExportView","app/paintShop/templates/page","app/paintShop/templates/mrpTabs","app/paintShop/templates/totals","app/paintShop/templates/printPage","app/paintShop/templates/userPageAction"],function(e,t,i,s,r,n,o,a,d,l,h,c,p,u,f,g,m,w,b,v,S,P,D,O,T,M,y,k,V,C,E,A,x,Z,_){"use strict";var N={started:1,partial:2,finished:3,delivered:4};return o.extend({template:E,layoutName:"page",pageId:"paintShop",modelProperty:"orders",breadcrumbs:function(){return[this.t("BREADCRUMB:base"),{href:"#paintShop/"+this.orders.getDateFilter(),label:this.orders.getDateFilter("L"),template:function(e){return'<span class="paintShop-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a><a href="'+e.href+'" data-action="showPicker">'+e.label+'</a><a class="fa fa-chevron-right" data-action="next"></a></span>'}}]},actions:function(){var e=this,t=[];return h.isEnabled()?t.push({id:"user",template:function(){return _({signedIn:!!e.orders.user,user:e.orders.user})},afterRender:function(t){t.find(".is-clickable").on("click",e.showUserPickerDialog.bind(e))}}):t.push({type:"link",icon:"arrows-alt",callback:e.toggleFullscreen.bind(e)},{icon:"download",privileges:"PAINT_SHOP:VIEW",label:e.t("PAGE_ACTION:exportPlanExecution"),callback:e.exportPlanExecution.bind(e)},{label:e.t("PAGE_ACTION:drilling"),icon:"circle-o",privileges:"DRILLING:VIEW",href:"#drilling/"+e.orders.getDateFilter()},{icon:"balance-scale",href:"#paintShop/load",privileges:"PAINT_SHOP:VIEW",label:e.t("PAGE_ACTION:load"),callback:function(){window.WMES_LAST_PAINT_SHOP_DATE=e.orders.getDateFilter()}},{icon:"paint-brush",href:"#paintShop/paints",privileges:"PAINT_SHOP:MANAGE",label:e.t("PAGE_ACTION:paints"),callback:function(){window.WMES_LAST_PAINT_SHOP_DATE=e.orders.getDateFilter()}},{href:"#paintShop;settings?tab=planning",icon:"cogs",label:e.t("PAGE_ACTION:settings"),privileges:"PAINT_SHOP:MANAGE"}),t},localTopics:{"socket.connected":function(){this.$el.removeClass("paintShop-is-disconnected")},"socket.disconnected":function(){this.$el.addClass("paintShop-is-disconnected")}},remoteTopics:{"paintShop.orders.changed.*":function(e){var t=this.orders.getDateFilter();s.utc.format(e.date,"YYYY-MM-DD")===t&&this.orders.applyChanges(e.changes)},"paintShop.orders.updated.*":function(e){var t=this.orders.get(e._id);t&&(t.set(S.parse(e)),null==e.qtyDlv&&null==e.qtyPaint&&null==e.status||this.orders.recountTotals())},"paintShop.dropZones.updated.*":function(e){this.dropZones.updated(e)},"paintShop.paints.added":function(e){this.paints.add(e.model)},"paintShop.paints.edited":function(e){var t=this.paints.get(e.model._id);t&&t.set(e.model)},"paintShop.paints.deleted":function(e){this.paints.remove(e.model._id)},"drilling.orders.changed.*":function(e){var t=this.drillingOrders.getDateFilter();s.utc.format(e.date,"YYYY-MM-DD")===t&&this.drillingOrders.applyChanges(e.changes)},"drilling.orders.updated.*":function(e){var t=this.drillingOrders.get(e._id);t&&t.set(w.parse(e))},"old.wh.orders.changed.*":function(e){var t=this.whOrders.getDateFilter();s.utc.format(e.date,"YYYY-MM-DD")===t&&this.promised(this.whOrders.fetch({reset:!0}))},"old.wh.orders.updated":function(e){this.whOrders.update(e.updated)}},events:{"mousedown .paintShop-tab":function(e){0===e.button&&(this.timers.showMrpMenu&&clearTimeout(this.timers.showMrpMenu),this.timers.showMrpMenu=setTimeout(this.showMrpMenu.bind(this,e),300))},"click .paintShop-tab-paint":function(){this.timers.showMrpMenu&&(clearTimeout(this.timers.showMrpMenu),this.timers.showMrpMenu=null,this.showPaintPickerDialog())},"click .paintShop-tab[data-mrp]":function(e){this.timers.showMrpMenu&&(clearTimeout(this.timers.showMrpMenu),this.timers.showMrpMenu=null,this.orders.selectMrp(e.currentTarget.dataset.mrp))},"contextmenu .paintShop-tab":function(e){return this.showMrpMenu(e),!1},"focus #-search":function(e){this.vkbView&&(clearTimeout(this.timers.hideVkb),this.vkbView.show(e.target,this.onVkbValueChange),this.vkbView.$el.css({left:"195px",bottom:"67px",marginLeft:"0"}))},"blur #-search":function(){this.vkbView&&this.scheduleHideVkb()},"input #-search":"onVkbValueChange"},initialize:function(){this.onResize=e.debounce(this.resize.bind(this),30),this.onVkbValueChange=this.onVkbValueChange.bind(this),this.defineModels(),this.defineViews(),this.once("afterRender",this.defineBindings),this.setView("#-queue",this.queueView),this.setView("#-todo",this.todoView),this.setView("#-done",this.doneView),h.isEnabled()&&this.setView("#-vkb",this.vkbView)},setUpLayout:function(e){this.layout=e},destroy:function(){this.hideMenu(),t(".modal").addClass("fade"),t(document.body).css("overflow","").removeClass("paintShop-is-fullscreen paintShop-is-embedded"),t(window).off("."+this.idPrefix),t(document).off("."+this.idPrefix),this.orderDetailsWindow&&(this.orderDetailsWindow.close(),this.orderDetailsWindow=null)},defineModels:function(){this.settings=a(new O(null,{pubsub:this.pubsub}),this),this.paints=a(new v(null,{rqlQuery:"limit(0)"}),this),this.dropZones=a(D.forDate(this.options.date),this),this.drillingOrders=a(m.forDate(this.options.date),this),this.whOrders=a(new b(null,{date:this.options.date,groupByOrderNo:!0}),this),this.orders=a(P.forDate(this.options.date,{selectedMrp:this.options.selectedMrp||"all",selectedPaint:this.options.selectedPaint||"all",settings:this.settings,paints:this.paints,dropZones:this.dropZones,user:JSON.parse(sessionStorage.getItem("WMES_PS_USER")||"null"),drillingOrders:this.drillingOrders,whOrders:this.whOrders}),this)},defineViews:function(){this.vkbView=h.isEnabled()?new u:null,this.todoView=new M({model:this.orders,showTimes:!1,showSearch:!0,showTotals:!1,vkb:this.vkbView,filter:function(e){return"new"===e.status||"cancelled"===e.status}}),this.doneView=new M({model:this.orders,showTimes:!0,showSearch:!1,showTotals:!0,filter:function(e){return N[e.status]>=1},sort:function(e,t){return"started"===e.status&&"started"===t.status||"partial"===e.status&&"partial"===t.status?e.startedAt-t.startedAt:e.status!==t.status?N[e.status]-N[t.status]:t.startedAt-e.startedAt}}),this.queueView=new T({orders:this.orders,dropZones:this.dropZones,vkb:this.vkbView,embedded:h.isEnabled()})},defineBindings:function(){var e=this.idPrefix;this.listenTo(this.orders,"reset",this.onOrdersReset),this.listenTo(this.orders,"mrpSelected",this.onMrpSelected),this.listenTo(this.orders,"paintSelected",this.onPaintSelected),this.listenTo(this.orders,"totalsRecounted",this.renderTotals),this.listenTo(this.dropZones,"reset",this.renderTabs),this.listenTo(this.dropZones,"updated",this.onDropZoneUpdated),this.listenTo(this.paints,"add change remove",this.onPaintUpdated),this.listenTo(this.queueView,"actionRequested",this.onActionRequested),this.listenTo(this.settings,"change",this.onSettingChanged),t(document).on("click."+e,".paintShop-breadcrumb",this.onBreadcrumbsClick.bind(this)),t(window).on("resize."+e,this.onResize)},load:function(e){var i=this,s=t.Deferred(),r=t.when(i.settings.fetch({reset:!0}),i.dropZones.fetch({reset:!0}),i.paints.fetch({reset:!0}),i.drillingOrders.fetch({reset:!0}),i.whOrders.fetch({reset:!0}));return r.fail(function(){s.reject.apply(s,arguments)}),r.done(function(){var e=i.promised(i.orders.fetch());e.fail(function(){s.reject.apply(s,arguments)}),e.done(function(){s.resolve()})}),e(s.promise())},getTemplateData:function(){return this.orders.serialize(),{embedded:h.isEnabled(),height:this.calcInitialHeight()+"px",renderTabs:A,renderTotals:x,tabs:this.serializeTabs(),totals:this.serializeTotals(),selectedPaint:{label:this.getSelectedPaintLabel(),dropped:this.isSelectedPaintDropped()}}},serializeTabs:function(){var e=this,t=e.orders,s=e.dropZones;return["all"].concat(t.allMrps||[]).map(function(r){return{mrp:r,label:r,description:i.has("paintShop","mrp:"+r)?e.t("mrp:"+r):"",active:t.selectedMrp===r,dropZone:s.getState(r)}})},serializeTotals:function(){return this.orders.serializeTotals()},beforeRender:function(){document.body.style.overflow="hidden",document.body.classList.toggle("paintShop-is-fullscreen",this.isFullscreen()),document.body.classList.toggle("paintShop-is-embedded",h.isEnabled())},afterRender:function(){this.$id("todo").on("scroll",this.todoView.onScroll.bind(this.todoView)),this.$id("queue").on("scroll",this.queueView.onScroll.bind(this.queueView)),this.$id("done").on("scroll",this.doneView.onScroll.bind(this.doneView)),t(".modal.fade").removeClass("fade"),this.resize(),this.toggleTabs(),h.render(this),h.ready()},resize:function(){this.el.style.height=this.calcHeight()+"px"},isFullscreen:function(){return h.isEnabled()||this.options.fullscreen||window.innerWidth<=800||window.outerWidth===window.screen.width&&window.outerHeight===window.screen.height},calcInitialHeight:function(){var e=window.innerHeight-15;return this.isFullscreen()?e-=64:e-=151,e},calcHeight:function(){var e=this.isFullscreen(),i=window.innerHeight-15;return document.body.classList.toggle("paintShop-is-fullscreen",e),i-=e?t(".hd").outerHeight(!0)+30:t(".hd").outerHeight(!0)+t(".ft").outerHeight(!0)},toggleFullscreen:function(){this.options.fullscreen=!this.options.fullscreen,this.updateUrl(),this.resize()},exportPlanExecution:function(){var e=new C({model:this.orders});n.showDialog(e,this.t("planExecutionExport:title"))},renderTabs:function(){this.$id("tabs").html(A({tabs:this.serializeTabs()}))},renderTotals:function(){this.$id("totals").html(x({totals:this.serializeTotals()}))},updateUrl:function(){h.isEnabled()||this.broker.publish("router.navigate",{url:this.genClientUrl(),trigger:!1,replace:!0})},genClientUrl:function(){var e=[];return"all"!==this.orders.selectedMrp&&e.push("mrp="+this.orders.selectedMrp),"all"!==this.orders.selectedPaint&&e.push("paint="+this.orders.selectedPaint),this.options.fullscreen&&e.push("fullscreen=1"),this.orders.genClientUrl()+(e.length?"?":"")+e.join("&")},showMrpMenu:function(e){this.timers.showMrpMenu&&(clearTimeout(this.timers.showMrpMenu),this.timers.showMrpMenu=null);var t=e.currentTarget.dataset.mrp||null,i=this.orders.isDrillingMrp(t);(i||"all"===t)&&(t=null);var s=h.isEnabled(),n={filterProperty:i||!t?null:"mrp",filterValue:t,drilling:i},o=[this.t("menu:header:"+(t?"mrp":"all"),{mrp:t}),{icon:"fa-clipboard",label:this.t("menu:copyOrders"),handler:this.handleCopyOrdersAction.bind(this,e,n),visible:!s},{icon:"fa-clipboard",label:this.t("menu:copyChildOrders"),handler:this.handleCopyChildOrdersAction.bind(this,e,n),visible:!s},{icon:"fa-print",label:this.t("menu:printOrders"),handler:this.handlePrintOrdersAction.bind(this,n)},{icon:"fa-download",label:this.t("menu:exportOrders"),handler:this.handleExportOrdersAction.bind(this,n),visible:!s}];t||i||o.push({label:this.t("menu:exportPaints"),handler:this.handleExportPaintsAction.bind(this,t),visible:!s}),r.isAllowedTo("PAINT_SHOP:DROP_ZONES")&&(t?o.push({icon:"fa-level-down",label:this.t("menu:dropZone:"+this.dropZones.getState(t)),handler:this.handleDropZoneAction.bind(this,t,!1)}):"all"!==this.orders.selectedPaint&&o.push({icon:"fa-level-down",label:this.t("menu:dropZone:"+this.dropZones.getState(this.orders.selectedPaint)),handler:this.handleDropZoneAction.bind(this,this.orders.selectedPaint,!0)})),g.show(this,e.pageY,e.pageX,o)},hideMenu:function(){g.hide(this)},handleOpenOrderAction:function(e){var t=this,i="/#orders/"+e.orderNo;if(h.isEnabled()){if(t.orderDetailsWindow&&!t.orderDetailsWindow.closed)return t.orderDetailsWindow.location.href=i,void t.orderDetailsWindow.focus();var s=Math.min(window.screen.availWidth-200,1500),r=Math.min(window.screen.availHeight-160,800),n=window.screen.availWidth-s-80,o=window.open("/#orders/"+e.orderNo,"WMES_ORDER_DETAILS","top=80,left="+n+",width="+s+",height="+r);o&&(o.onPageShown=function(){o&&!o.closed&&(o.focus(),t.orderDetailsWindow=o)},o.onfocus=function(){clearTimeout(t.timers.closeOrderDetails)},o.onblur=function(){t.timers.closeOrderDetails=setTimeout(function(){t.orderDetailsWindow&&(t.orderDetailsWindow.close(),t.orderDetailsWindow=null)},3e4)},o.focus())}else window.open(i)},handleCopyOrdersAction:function(e,t){var i=this,s=e.currentTarget,r=e.pageX,n=e.pageY,o=t.filterProperty,a=t.filterValue,d=t.drilling;p.copy(function(e){if(e){var t=[],l={};i.orders.serialize().forEach(function(e){if(!d||e.drilling){var s=e.order;if("order"===o){if(s!==a)return}else{if("cancelled"===e.status)return;if("mrp"===o&&e.mrp!==a)return;if(!i.orders.isPaintVisible(e))return}l[s]||(t.push(s),l[s]=!0)}}),e.setData("text/plain",t.join("\r\n")),p.showTooltip(i,s,r,n,{title:i.t("menu:copyOrders:success")})}})},handleCopyChildOrdersAction:function(e,t){var i=this,s=e.currentTarget,r=e.pageX,n=e.pageY,o=t.filterProperty,a=t.filterValue,d=t.drilling;p.copy(function(e){if(e){var t=[];i.orders.serialize().forEach(function(e){if(!d||e.drilling){var s=e.order;if("order"===o){if(s!==a)return}else{if("cancelled"===e.status)return;if("mrp"===o&&e.mrp!==a)return;if(!i.orders.isPaintVisible(e))return}e.childOrders.forEach(function(e){i.orders.isPaintVisible(e)&&t.push(e.order)})}}),e.setData("text/plain",t.join("\r\n")),p.showTooltip(i,s,r,n,{title:i.t("menu:copyChildOrders:success")})}})},handlePrintOrdersAction:function(e,t){var i=this,s=e.filterProperty,r=e.filterValue,n=e.drilling;t.contextMenu.tag="paintShop",f.contextMenu(t,function(e){var t=i.orders.filter(function(e){if("cancelled"===e.get("status"))return!1;var t=e.serialize();return!(n&&!t.drilling)&&(!!i.orders.isPaintVisible(t)&&(!r||e.get(s)===r))});if(t.length){var o=i.renderPartialHtml(Z,{drilling:n,date:+i.orders.getDateFilter("x"),mrp:r?"order"===s?t[0].get("mrp"):r:null,orderNo:"order"===s?r:null,pages:i.serializePrintPages(t)});l(o,e)}})},handleExportOrdersAction:function(e){var t="/paintShop/orders;export.xlsx?sort(date,no)&limit(0)&date="+this.orders.getDateFilter();"mrp"===e.filterProperty&&(t+="&mrp="+e.filterValue);var i=this.orders.selectedPaint,s=(this.settings.getValue("mspPaints")||[]).map(function(e){return"string:"+e}).join(",");e.drilling?t+="&paint.nc12=000000000000":"msp"===i&&s.length?t+="&childOrders.components.nc12=in=("+s+")":"all"!==i&&(t+="&childOrders.components.nc12=string:"+i),c.exportXlsx(t)},handleExportPaintsAction:function(){var e=n.msg.show({type:"warning",text:i("core","MSG:EXPORTING")}),t=new k({orders:this.orders,dropZones:this.dropZones}),s=this.ajax({method:"POST",url:"/xlsxExporter",data:JSON.stringify({filename:"WMES-PAINT_SHOP-PAINTS",freezeRows:1,freezeColumns:1,columns:{nc12:13,name:40,weight:{type:"integer",width:8},manHours:{type:"decimal",width:6},dropZone:"boolean",pending:"integer",started1:"integer",started2:"integer",partial:"integer",finished:"integer",delivered:"integer",cancelled:"integer"},data:t.serialize().paints.map(function(e){return{nc12:e.nc12,name:e.name,weight:e.weight,manHours:e.manHours,dropZone:e.dropped,pending:e.totals.new,started1:e.totals.started1,started2:e.totals.started2,partial:e.totals.partial,finished:e.totals.finished,delivered:e.totals.delivered,cancelled:e.totals.cancelled}})})});s.fail(function(){n.msg.hide(e,!0),n.msg.show({type:"error",time:2500,text:i("core","MSG:EXPORTING_FAILURE")})}),s.done(function(t){n.msg.hide(e,!0),c.exportXlsx("/xlsxExporter/"+t)})},handleDropZoneAction:function(e,t){var i,s,r=this;t?(i=r.$(".paintShop-tab-paint"),s=i.find(".fa-paint-brush").first().removeClass("fa-paint-brush").addClass("fa-spinner fa-spin")):(i=r.$('.paintShop-tab[data-mrp="'+e+'"]').addClass("is-loading"),s=i.find(".fa").removeClass("fa-level-down").addClass("fa-spinner fa-spin"));var o=r.promised(r.dropZones.toggle(e));o.fail(function(){i.toggleClass("is-dropped",r.dropZones.getState(e)),n.msg.show({type:"error",time:2500,text:r.t("menu:dropZone:failure")})}),o.done(function(e){i.toggleClass("is-dropped",e.state)}),o.always(function(){s.removeClass("fa-spinner fa-spin").addClass(t?"fa-paint-brush":"fa-level-down"),i.removeClass("is-loading")}),this.dropZones.updated({_id:{date:this.dropZones.date,mrp:e},state:!this.dropZones.getState(e)})},getSelectedPaintLabel:function(){var e=this.orders.selectedPaint;return i.has("paintShop","tabs:paint:"+e)?this.t("tabs:paint:"+e):e},isSelectedPaintDropped:function(){return this.dropZones.getState(this.orders.selectedPaint)},serializePrintPages:function(e){var t=[{rows:[]}],i=function(e){var i=t[t.length-1];44===i.rows.length?t.push({rows:[e]}):i.rows.push(e)};return e.forEach(function(e){i({type:"order",no:e.get("no")+".",order:e.get("order"),nc12:e.get("nc12"),qty:e.get("qty"),unit:"PCE",name:e.get("name"),mrp:e.get("mrp")}),e.get("childOrders").forEach(function(e){i({type:"childOrder",no:"",order:e.order,nc12:e.nc12,qty:e.qty,unit:"PCE",name:e.name,mrp:""}),e.components.forEach(function(e){S.isComponentBlacklisted(e)||i({type:"component",no:"",order:"",nc12:e.nc12,qty:Math.ceil(e.qty),unit:e.unit,name:e.name,mrp:""})})})}),t},scheduleHideVkb:function(){var e=this;clearTimeout(e.timers.hideVkb),e.vkbView.isVisible()&&(e.timers.hideVkb=setTimeout(function(){e.vkbView.hide(),e.vkbView.$el.css({left:"",bottom:"",marginLeft:""}),e.$id("search").val("").addClass("is-empty").css("background","")},250))},searchOrder:function(e){var t=this;t.vkbView&&t.vkbView.hide();var i=t.$id("search").blur(),r=t.orders.getFirstByOrderNo(e);if(r)return i.val("").addClass("is-empty").css("background",""),r.get("mrp")!==t.orders.selectedMrp&&t.orders.selectMrp(r.get("mrp")),void t.orders.trigger("focus",r.id,{showDetails:!0});i.prop("disabled",!0),n.msg.loading();var o=this.ajax({url:"/paintShop/orders?select(date,mrp)&limit(1)&or(eq(order,string:"+e+"),eq(childOrders.order,string:"+e+"))"});function a(){n.msg.show({type:"warning",time:2500,text:t.t("MSG:search:failure")}),d("#f2dede")}function d(e){i.css("background",e),setTimeout(function(){i.prop("disabled",!1).val("").addClass("is-empty").css("background","").focus()},1337)}o.fail(a),o.done(function(e){if(0===e.totalCount)return a();var i=e.collection[0];t.orders.setDateFilter(s.utc.format(i.date,"YYYY-MM-DD"));var r=t.orders.fetch({reset:!0});r.fail(a),r.done(function(){t.orders.selectedMrp!==i.mrp&&t.orders.selectMrp(i.mrp),t.orders.trigger("focus",i._id,{showDetails:!0}),d("#ddffdd")})}),o.always(function(){n.msg.loaded()})},onVkbValueChange:function(){var e=this.$id("search"),t=e.val();e.toggleClass("is-empty",""===t).css("background",/[^0-9]+/.test(t)?"#f2dede":""),/^[0-9]{9}$/.test(t)&&this.searchOrder(t)},onSettingChanged:function(e){"paintShop.mspPaints"===e.id&&this.renderTotals()},onActionRequested:function(e){switch(e){case"openOrder":e=this.handleOpenOrderAction;break;case"copyOrders":e=this.handleCopyOrdersAction;break;case"copyChildOrders":e=this.handleCopyChildOrdersAction;break;case"dropZone":e=this.handleDropZoneAction;break;case"printOrders":e=this.handlePrintOrdersAction;break;case"exportOrders":e=this.handleExportOrdersAction;break;default:return}e.apply(this,Array.prototype.splice.call(arguments,1))},onOrdersReset:function(){this.layout&&this.layout.setBreadcrumbs(this.breadcrumbs,this),this.updateUrl(),this.renderTabs(),this.renderTotals()},onMrpSelected:function(){this.updateUrl(),this.renderTotals(),this.$(".paintShop-tab.is-active").removeClass("is-active"),this.$('.paintShop-tab[data-mrp="'+this.orders.selectedMrp+'"]').addClass("is-active")},onPaintSelected:function(){this.updateUrl(),this.renderTotals(),this.toggleTabs(),this.$id("selectedPaint").toggleClass("is-dropped",this.isSelectedPaintDropped()).find("span").text(this.getSelectedPaintLabel())},onDropZoneUpdated:function(e){var t=e.get("mrp"),i=t===this.orders.selectedPaint?".paintShop-tab-paint":'.paintShop-tab[data-mrp="'+t+'"]';this.$(i).toggleClass("is-dropped",e.get("state"))},onPaintUpdated:function(){this.orders.serialize(!0),this.orders.trigger("reset")},onBreadcrumbsClick:function(e){if("A"===e.target.tagName)return!e.target.classList.contains("disabled")&&("showPicker"===e.target.dataset.action?this.showDatePickerDialog():this.selectNonEmptyDate(e.target.dataset.action),!1)},setDate:function(e){var i=this;i.orders.setDateFilter(e),i.drillingOrders.setDateFilter(e),i.whOrders.setDateFilter(e),i.dropZones.setDate(i.orders.getDateFilter()),i.orders.reset([]),i.drillingOrders.reset([]),i.whOrders.reset([]),i.dropZones.reset([]);var s=i.promised(i.dropZones.fetch({reset:!0})),r=i.drillingOrders.fetch({reset:!0}),n=i.whOrders.fetch({reset:!0});t.when(s,r,n).done(function(){i.promised(i.orders.fetch({reset:!0}))})},showDatePickerDialog:function(){var e=new y({model:{date:this.orders.getDateFilter()},vkb:this.vkbView});this.listenTo(e,"picked",function(e){n.closeDialog(),e!==this.orders.getDateFilter()&&this.setDate(e)}),n.showDialog(e)},showPaintPickerDialog:function(){var e=new k({orders:this.orders,dropZones:this.dropZones,vkb:this.vkbView});this.listenTo(e,"picked",function(e){n.closeDialog(),this.orders.selectPaint(e)}),n.showDialog(e)},selectNonEmptyDate:function(e){t(".paintShop-breadcrumb").find("a").addClass("disabled");var i=this,r=+i.orders.getDateFilter("x"),o="/paintShop/orders?limit(1)&select(date)";o+="prev"===e?"&sort(-date)&date<"+r+"&date>"+(r-2592e6):"&sort(date)&date>"+r+"&date<"+(r+2592e6);var a=i.ajax({url:o});a.done(function(e){e.totalCount?i.setDate(s.utc.format(e.collection[0].date,"YYYY-MM-DD")):n.msg.show({type:"warning",time:2500,text:i.t("MSG:date:empty")})}),a.fail(function(){n.msg.show({type:"error",time:2500,text:i.t("MSG:date:failure")})}),a.always(function(){i.layout&&i.layout.setBreadcrumbs(i.breadcrumbs,i)})},showUserPickerDialog:function(){var e=this,t=new V({model:{user:e.orders.user}});e.listenTo(t,"picked",function(t){t?sessionStorage.setItem("WMES_PS_USER",JSON.stringify(t)):sessionStorage.removeItem("WMES_PS_USER"),e.orders.user=t,e.layout&&e.layout.setActions(e.actions,e),n.closeDialog()}),n.showDialog(t)},toggleTabs:function(){var e=this.orders.selectedPaint,t=this.orders.paintToMrp[e]||{};this.$(".paintShop-tab[data-mrp]").each(function(){var i=this.dataset.mrp;i&&"all"!==i&&this.classList.toggle("is-disabled","all"!==e&&!t[i])})}})});