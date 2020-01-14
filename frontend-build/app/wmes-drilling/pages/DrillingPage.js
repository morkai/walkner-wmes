define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/util/bindLoadingMessage","app/core/util/getShiftStartInfo","app/core/util/html2pdf","app/core/util/embedded","app/core/util/pageActions","app/data/clipboard","app/production/views/VkbView","app/printers/views/PrinterPickerView","app/planning/util/contextMenu","../DrillingOrder","../DrillingOrderCollection","../DrillingSettingCollection","../views/QueueView","../views/ListView","../views/DatePickerView","../views/UserPickerView","app/wmes-drilling/templates/page","app/wmes-drilling/templates/mrpTabs","app/wmes-drilling/templates/totals","app/wmes-drilling/templates/printPage","app/wmes-drilling/templates/userPageAction"],function(e,t,i,r,s,n,o,a,l,d,c,u,h,p,f,g,m,w,b,v,y,M,D,V,k,T,O,C){"use strict";var E={started:1,partial:2,finished:3,painted:4};return o.extend({template:V,layoutName:"page",pageId:"drilling",modelProperty:"orders",breadcrumbs:function(){return[this.t("BREADCRUMB:base"),{href:"#drilling/"+this.orders.getDateFilter(),label:this.orders.getDateFilter("L"),template:function(e){return'<span class="drilling-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a><a href="'+e.href+'" data-action="showPicker">'+e.label+'</a><a class="fa fa-chevron-right" data-action="next"></a></span>'}}]},actions:function(){var e=this,t=[];return c.isEnabled()?t.push({id:"user",template:function(){return C({signedIn:!!e.orders.user,user:e.orders.user})},afterRender:function(t){t.find(".is-clickable").on("click",e.showUserPickerDialog.bind(e))}}):t.push({type:"link",icon:"arrows-alt",callback:e.toggleFullscreen.bind(e)},{label:e.t("PAGE_ACTION:paintShop"),icon:"paint-brush",privileges:"PAINT_SHOP:VIEW",href:"#paintShop/"+e.orders.getDateFilter()},{href:"#drilling;settings?tab=planning",icon:"cogs",label:e.t("PAGE_ACTION:settings"),privileges:"DRILLING:MANAGE"}),t},localTopics:{"socket.connected":function(){this.$el.removeClass("drilling-is-disconnected")},"socket.disconnected":function(){this.$el.addClass("drilling-is-disconnected")}},remoteTopics:{"drilling.orders.changed.*":function(e){var t=this.orders.getDateFilter();r.utc.format(e.date,"YYYY-MM-DD")===t&&this.orders.applyChanges(e.changes)},"drilling.orders.updated.*":function(e){var t=this.orders.get(e._id);t&&(t.set(m.parse(e)),null==e.qtyDrill&&null==e.status||this.orders.recountTotals())}},events:{"mousedown .drilling-tab":function(e){0===e.button&&(this.timers.showMrpMenu&&clearTimeout(this.timers.showMrpMenu),this.timers.showMrpMenu=setTimeout(this.showMrpMenu.bind(this,e),300))},"click .drilling-tab[data-mrp]":function(e){this.timers.showMrpMenu&&(clearTimeout(this.timers.showMrpMenu),this.timers.showMrpMenu=null,this.orders.selectMrp(e.currentTarget.dataset.mrp))},"contextmenu .drilling-tab":function(e){return this.showMrpMenu(e),!1},"focus #-search":function(e){this.vkbView&&(clearTimeout(this.timers.hideVkb),this.vkbView.show(e.target,this.onVkbValueChange),this.vkbView.$el.css({left:"195px",bottom:"67px",marginLeft:"0"}))},"blur #-search":function(){this.vkbView&&this.scheduleHideVkb()},"input #-search":"onVkbValueChange"},initialize:function(){this.onResize=e.debounce(this.resize.bind(this),30),this.onVkbValueChange=this.onVkbValueChange.bind(this),this.defineModels(),this.defineViews(),this.defineBindings(),this.setView("#-queue",this.queueView),this.setView("#-todo",this.todoView),this.setView("#-done",this.doneView),c.isEnabled()&&this.setView("#-vkb",this.vkbView)},setUpLayout:function(e){this.layout=e},destroy:function(){this.hideMenu(),t(".modal").addClass("fade"),t(document.body).css("overflow","").removeClass("drilling-is-fullscreen drilling-is-embedded"),t(window).off("."+this.idPrefix),t(document).off("."+this.idPrefix),this.orderDetailsWindow&&(this.orderDetailsWindow.close(),this.orderDetailsWindow=null)},defineModels:function(){this.settings=a(new b(null,{pubsub:this.pubsub}),this),this.orders=a(w.forDate(this.options.date,{selectedMrp:this.options.selectedMrp||"all",settings:this.settings,user:JSON.parse(sessionStorage.getItem("WMES_DRILL_USER")||"null")}),this)},defineViews:function(){this.vkbView=c.isEnabled()?new p:null,this.todoView=new y({model:this.orders,showTimes:!1,showSearch:!0,showTotals:!1,vkb:this.vkbView,filter:function(e){return"new"===e.status||"cancelled"===e.status}}),this.doneView=new y({model:this.orders,showTimes:!0,showSearch:!1,showTotals:!0,filter:function(e){return E[e.status]>=1},sort:function(e,t){return"started"===e.status&&"started"===t.status||"partial"===e.status&&"partial"===t.status?e.startedAt-t.startedAt:e.status!==t.status?E[e.status]-E[t.status]:t.startedAt-e.startedAt}}),this.queueView=new v({orders:this.orders,vkb:this.vkbView,embedded:c.isEnabled()})},defineBindings:function(){var i=this,r=i.idPrefix;i.listenTo(i.orders,"reset",e.after(2,i.onOrdersReset)),i.listenTo(i.orders,"mrpSelected",i.onMrpSelected),i.listenTo(i.orders,"totalsRecounted",i.renderTotals),i.listenTo(i.queueView,"actionRequested",i.onActionRequested),t(document).on("click."+r,".drilling-breadcrumb",i.onBreadcrumbsClick.bind(i)),t(window).on("resize."+r,i.onResize),i.once("afterRender",function(){c.ready(),i.onOrdersReset()})},load:function(e){return e(this.settings.fetch({reset:!0}),this.orders.fetch({reset:!0}))},getTemplateData:function(){return{embedded:c.isEnabled(),height:this.calcInitialHeight()+"px",renderTabs:k,renderTotals:T,tabs:this.serializeTabs(),totals:this.serializeTotals()}},serializeTabs:function(){var e=this,t=e.orders;return["all"].concat(t.allMrps||[]).map(function(r){return{mrp:r,label:r,description:i.has("wmes-drilling","mrp:"+r)?e.t("mrp:"+r):"",active:t.selectedMrp===r}})},serializeTotals:function(){return this.orders.serializeTotals()},beforeRender:function(){document.body.style.overflow="hidden",document.body.classList.toggle("drilling-is-fullscreen",this.isFullscreen()),document.body.classList.toggle("drilling-is-embedded",c.isEnabled())},afterRender:function(){this.$id("todo").on("scroll",this.todoView.onScroll.bind(this.todoView)),this.$id("queue").on("scroll",this.queueView.onScroll.bind(this.queueView)),this.$id("done").on("scroll",this.doneView.onScroll.bind(this.doneView)),t(".modal.fade").removeClass("fade"),c.render(this),this.resize()},resize:function(){this.el.style.height=this.calcHeight()+"px"},isFullscreen:function(){return c.isEnabled()||this.options.fullscreen||window.innerWidth<=800||window.outerWidth===window.screen.width&&window.outerHeight===window.screen.height},calcInitialHeight:function(){var e=window.innerHeight-15;return this.isFullscreen()?e-=64:e-=151,e},calcHeight:function(){var e=this.isFullscreen(),i=window.innerHeight-15;return document.body.classList.toggle("drilling-is-fullscreen",e),i-=e?t(".hd").outerHeight(!0)+30:t(".hd").outerHeight(!0)+t(".ft").outerHeight(!0)},toggleFullscreen:function(){this.options.fullscreen=!this.options.fullscreen,this.updateUrl(),this.resize()},renderTabs:function(){this.$id("tabs").html(k({tabs:this.serializeTabs()}))},renderTotals:function(){this.$id("totals").html(T({totals:this.serializeTotals()}))},updateUrl:function(){c.isEnabled()||this.broker.publish("router.navigate",{url:this.genClientUrl(),trigger:!1,replace:!0})},genClientUrl:function(){var e=[];return"all"!==this.orders.selectedMrp&&e.push("mrp="+this.orders.selectedMrp),this.options.fullscreen&&e.push("fullscreen=1"),this.orders.genClientUrl()+(e.length?"?":"")+e.join("&")},showMrpMenu:function(e){this.timers.showMrpMenu&&(clearTimeout(this.timers.showMrpMenu),this.timers.showMrpMenu=null);var t=c.isEnabled(),i=e.currentTarget.dataset.mrp||null;"all"===i&&(i=null);var r={filterProperty:i?"mrp":null,filterValue:i},s=[this.t("menu:header:"+(i?"mrp":"all"),{mrp:i}),{icon:"fa-clipboard",label:this.t("menu:copyOrders"),handler:this.handleCopyOrdersAction.bind(this,e,r),visible:!t},{icon:"fa-clipboard",label:this.t("menu:copyChildOrders"),handler:this.handleCopyChildOrdersAction.bind(this,e,r),visible:!t},{icon:"fa-print",label:this.t("menu:printOrders"),handler:this.handlePrintOrdersAction.bind(this,r)},{icon:"fa-download",label:this.t("menu:exportOrders"),handler:this.handleExportOrdersAction.bind(this,r),visible:!t}];g.show(this,e.pageY,e.pageX,s)},hideMenu:function(){g.hide(this)},handleOpenOrderAction:function(e){var t=this,i="/#orders/"+e.orderNo;if(c.isEnabled()){if(t.orderDetailsWindow&&!t.orderDetailsWindow.closed)return t.orderDetailsWindow.location.href=i,void t.orderDetailsWindow.focus();var r=Math.min(window.screen.availWidth-200,1500),s=Math.min(window.screen.availHeight-160,800),n=window.screen.availWidth-r-80,o=window.open("/#orders/"+e.orderNo,"WMES_ORDER_DETAILS","top=80,left="+n+",width="+r+",height="+s);o&&(o.onPageShown=function(){o&&!o.closed&&(o.focus(),t.orderDetailsWindow=o)},o.onfocus=function(){clearTimeout(t.timers.closeOrderDetails)},o.onblur=function(){t.timers.closeOrderDetails=setTimeout(function(){t.orderDetailsWindow&&(t.orderDetailsWindow.close(),t.orderDetailsWindow=null)},3e4)},o.focus())}else window.open(i)},handleCopyOrdersAction:function(e,t){var i=this,r=e.currentTarget,s=e.pageX,n=e.pageY,o=t.filterProperty,a=t.filterValue,l=t.drilling;h.copy(function(e){if(e){var t=[],d={};i.orders.serialize().forEach(function(e){if(!l||e.drilling){var i=e.order;if("order"===o){if(i!==a)return}else{if("cancelled"===e.status)return;if("mrp"===o&&e.mrp!==a)return}d[i]||(t.push(i),d[i]=!0)}}),e.setData("text/plain",t.join("\r\n")),h.showTooltip(i,r,s,n,{title:i.t("menu:copyOrders:success")})}})},handleCopyChildOrdersAction:function(e,t){var i=this,r=e.currentTarget,s=e.pageX,n=e.pageY,o=t.filterProperty,a=t.filterValue;h.copy(function(e){if(e){var t=[];i.orders.serialize().forEach(function(e){var i=e.order;if("order"===o){if(i!==a)return}else{if("cancelled"===e.status)return;if("mrp"===o&&e.mrp!==a)return}e.childOrders.forEach(function(e){t.push(e.order)})}),e.setData("text/plain",t.join("\r\n")),h.showTooltip(i,r,s,n,{title:i.t("menu:copyChildOrders:success")})}})},handlePrintOrdersAction:function(e,t){var i=this,r=e.filterProperty,s=e.filterValue;t.contextMenu.tag="paintShop",f.contextMenu(t,function(e){var t=i.orders.filter(function(e){return"cancelled"!==e.get("status")&&(!s||e.get(r)===s)});if(t.length){var n=i.renderPartialHtml(O,{date:+i.orders.getDateFilter("x"),mrp:s?"order"===r?t[0].get("mrp"):s:null,orderNo:"order"===r?s:null,pages:i.serializePrintPages(t)});d(n,e)}})},handleExportOrdersAction:function(e){var t="/drilling/orders;export.xlsx?sort(date,no)&limit(0)&date="+this.orders.getDateFilter();"mrp"===e.filterProperty&&(t+="&mrp="+e.filterValue),u.exportXlsx(t)},serializePrintPages:function(e){var t=[{rows:[]}],i=function(e){var i=t[t.length-1];44===i.rows.length?t.push({rows:[e]}):i.rows.push(e)};return e.forEach(function(e){i({type:"order",no:e.get("no")+".",order:e.get("order"),nc12:e.get("nc12"),qty:e.get("qty"),unit:"PCE",name:e.get("name"),mrp:e.get("mrp")}),e.get("childOrders").forEach(function(e){i({type:"childOrder",no:"",order:e.order,nc12:e.nc12,qty:e.qty,unit:"PCE",name:e.name,mrp:""}),e.components.forEach(function(e){m.isComponentBlacklisted(e)||i({type:"component",no:"",order:"",nc12:e.nc12,qty:Math.ceil(e.qty),unit:e.unit,name:e.name,mrp:""})})})}),t},scheduleHideVkb:function(){var e=this;clearTimeout(e.timers.hideVkb),e.vkbView.isVisible()&&(e.timers.hideVkb=setTimeout(function(){e.vkbView.hide(),e.vkbView.$el.css({left:"",bottom:"",marginLeft:""}),e.$id("search").val("").addClass("is-empty").css("background","")},250))},searchOrder:function(e){var t=this;t.vkbView&&t.vkbView.hide();var i=t.$id("search").blur(),s=t.orders.getFirstByOrderNo(e);if(s)return i.val("").addClass("is-empty").css("background",""),s.get("mrp")!==t.orders.selectedMrp&&t.orders.selectMrp(s.get("mrp")),void t.orders.trigger("focus",s.id,{showDetails:!0});i.prop("disabled",!0),n.msg.loading();var o=this.ajax({url:"/drilling/orders?select(date,mrp)&limit(1)&or(eq(order,string:"+e+"),eq(childOrders.order,string:"+e+"))"});function a(){n.msg.show({type:"warning",time:2500,text:t.t("MSG:search:failure")}),l("#f2dede")}function l(e){i.css("background",e),setTimeout(function(){i.prop("disabled",!1).val("").addClass("is-empty").css("background","").focus()},1337)}o.fail(a),o.done(function(e){if(0===e.totalCount)return a();var i=e.collection[0];t.orders.setDateFilter(r.utc.format(i.date,"YYYY-MM-DD"));var s=t.orders.fetch({reset:!0});s.fail(a),s.done(function(){t.orders.selectedMrp!==i.mrp&&t.orders.selectMrp(i.mrp),t.orders.trigger("focus",i._id,{showDetails:!0}),l("#ddffdd")})}),o.always(function(){n.msg.loaded()})},onVkbValueChange:function(){var e=this.$id("search"),t=e.val();e.toggleClass("is-empty",""===t).css("background",/[^0-9]+/.test(t)?"#f2dede":""),/^[0-9]{9}$/.test(t)&&this.searchOrder(t)},onActionRequested:function(e){switch(e){case"openOrder":e=this.handleOpenOrderAction;break;case"copyOrders":e=this.handleCopyOrdersAction;break;case"copyChildOrders":e=this.handleCopyChildOrdersAction;break;case"printOrders":e=this.handlePrintOrdersAction;break;case"exportOrders":e=this.handleExportOrdersAction;break;default:return}e.apply(this,Array.prototype.splice.call(arguments,1))},onOrdersReset:function(){this.layout&&this.layout.setBreadcrumbs(this.breadcrumbs,this),this.updateUrl(),this.renderTabs(),this.renderTotals()},onMrpSelected:function(){this.updateUrl(),this.renderTotals(),this.$(".drilling-tab.is-active").removeClass("is-active"),this.$('.drilling-tab[data-mrp="'+this.orders.selectedMrp+'"]').addClass("is-active")},onBreadcrumbsClick:function(e){if("A"===e.target.tagName)return!e.target.classList.contains("disabled")&&("showPicker"===e.target.dataset.action?this.showDatePickerDialog():this.selectNonEmptyDate(e.target.dataset.action),!1)},setDate:function(e){this.orders.setDateFilter(e),this.promised(this.orders.fetch({reset:!0}))},showDatePickerDialog:function(){var e=new M({model:{date:this.orders.getDateFilter()},vkb:this.vkbView});this.listenTo(e,"picked",function(e){n.closeDialog(),e!==this.orders.getDateFilter()&&this.setDate(e)}),n.showDialog(e)},selectNonEmptyDate:function(e){t(".drilling-breadcrumb").find("a").addClass("disabled");var i=this,s=+i.orders.getDateFilter("x"),o="/drilling/orders?limit(1)&select(date)";o+="prev"===e?"&sort(-date)&date<"+s+"&date>"+(s-2592e6):"&sort(date)&date>"+s+"&date<"+(s+2592e6);var a=i.ajax({url:o});a.done(function(e){e.totalCount?i.setDate(r.utc.format(e.collection[0].date,"YYYY-MM-DD")):n.msg.show({type:"warning",time:2500,text:i.t("MSG:date:empty")})}),a.fail(function(){n.msg.show({type:"error",time:2500,text:i.t("MSG:date:failure")})}),a.always(function(){i.layout&&i.layout.setBreadcrumbs(i.breadcrumbs,i)})},showUserPickerDialog:function(){var e=this,t=new D({model:{user:e.orders.user}});e.listenTo(t,"picked",function(t){t?sessionStorage.setItem("WMES_DRILL_USER",JSON.stringify(t)):sessionStorage.removeItem("WMES_DRILL_USER"),e.orders.user=t,e.layout&&e.layout.setActions(e.actions,e),n.closeDialog()}),n.showDialog(t)}})});