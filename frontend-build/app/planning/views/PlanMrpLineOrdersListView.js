// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/viewport","app/core/View","app/data/clipboard","app/orderStatuses/util/renderOrderStatusLabel","../util/shift","../util/contextMenu","../PlanSapOrder","./PlanOrderDropZoneDialogView","app/core/templates/userInfo","app/planning/templates/lineOrdersList","app/planning/templates/lineOrderComments"],function(t,e,n,r,i,s,a,o,d,p,l,h,u,c,g){"use strict";return s.extend({template:c,events:{"mouseenter tbody > tr":function(t){this.mrp.orders.trigger("highlight",{source:"lineOrders",state:!0,orderNo:t.currentTarget.dataset.id})},"mouseleave tbody > tr":function(t){this.mrp.orders.trigger("highlight",{source:"lineOrders",state:!1,orderNo:t.currentTarget.dataset.id})},"contextmenu tbody > tr":function(t){return this.showMenu(t),!1},"dblclick tr":function(t){window.getSelection().removeAllRanges();var e=t.currentTarget,n=e.dataset.index,r=t.clientY-t.currentTarget.getBoundingClientRect().top;this.$el.toggleClass("is-expanded"),this.expanded=this.$el.hasClass("is-expanded"),this.expanded?window.scrollTo(0,window.scrollY+e.getBoundingClientRect().top-t.clientY+r):n>=10&&(window.scrollTo(0,this.$el.closest(".planning-mrp")[0].offsetTop),t.currentTarget.scrollIntoView({block:"center"}),window.scrollBy(0,(t.clientY-e.getBoundingClientRect().top-r)*-1))},"mousedown .planning-mrp-lineOrders-comment":function(t){if(0===t.button){var e=this.plan.sapOrders.get(t.currentTarget.parentNode.dataset.id);if(e){var n=e.get("comments");n.length&&this.$(t.currentTarget).popover({trigger:"manual",placement:"left",html:!0,content:g({comments:n.map(function(t){return{user:u({noIp:!0,userInfo:t.user}),time:r.toTagData(t.time).human,text:l.formatCommentWithIcon(t)}})}),template:'<div class="popover planning-mrp-comment-popover"><div class="arrow"></div><div class="popover-content"></div></div>'}).popover("show")}}},"mouseup .planning-mrp-lineOrders-comment":function(t){this.$(t.currentTarget).popover("destroy")}},initialize:function(){var t=this;t.expanded=!1,t.listenTo(t.mrp.lines,"reset added changed removed",t.renderIfNotLoading),t.listenTo(t.mrp.orders,"highlight",t.onOrderHighlight),t.listenTo(t.plan.sapOrders,"change:comments",t.onCommentChange),t.listenTo(t.plan.sapOrders,"reset",t.onSapOrdersReset),t.listenTo(t.plan.sapOrders,"change:psStatus",t.onPsStatusChanged),t.listenTo(t.plan.sapOrders,"change:whStatus",t.onWhStatusChanged),t.listenTo(t.plan.sapOrders,"change:whDropZone change:whTime",t.onWhDropZoneChanged)},serialize:function(){return{idPrefix:this.idPrefix,expanded:this.expanded,orders:this.serializeOrders()}},renderIfNotLoading:function(){this.plan.isAnythingLoading()||this.render()},serializeOrders:function(){var e=this,n=e.plan.sapOrders,i=e.mrp,s={};return i.lines.forEach(function(t){t.orders.forEach(function(r){var a=r.get("orderNo"),o=i.orders.get(a);if(o){var d=n.get(a),p=s[a];p||(p=s[a]={orderNo:o.id,nc12:o.get("nc12"),name:o.get("name"),startTime:Number.MAX_VALUE,finishTime:0,qtyTodo:o.get("quantityTodo"),qtyPlan:0,lines:{},comment:d?d.getCommentWithIcon():"",comments:d?d.get("comments"):[],status:o.getStatus(),statuses:e.serializeOrderStatuses(o),dropZone:d?d.getDropZone():""}),p.qtyPlan+=r.get("quantity");var l=Date.parse(r.get("startAt"));l<p.startTime&&(p.startTime=l);var h=Date.parse(r.get("finishAt"));h>p.finishTime&&(p.finishTime=h),p.lines[t.id]||(p.lines[t.id]=0),p.lines[t.id]+=r.get("quantity")}})}),t.values(s).sort(function(t,e){return t.startTime-e.startTime}).map(function(e,n){return e.no=n+1,e.shift=d.getShiftNo(e.startTime),e.startTime=r.utc.format(e.startTime,"HH:mm:ss"),e.finishTime=r.utc.format(e.finishTime,"HH:mm:ss"),e.lines=t.map(e.lines,function(t,e){return e+" ("+t+")"}).join("; "),e})},serializeOrderStatuses:function(t){var e=[],r=this.plan.getActualOrderData(t.id),i=t.getKindIcon(),s=t.getSourceIcon(),a=this.plan.sapOrders.getPsStatus(t.id),d=this.plan.sapOrders.getWhStatus(t.id);return t.get("ignored")&&e.push(this.formatIcon(t.getIcon("ignored"),"orders:ignored")),i&&e.push(this.formatIcon(i,"orderPriority:"+t.get("kind"))),s&&e.push(this.formatIcon(s,"orders:source:"+t.get("source"))),t.get("urgent")&&e.push(this.formatIcon(t.getIcon("urgent"),"orders:urgent")),t.isPinned()&&e.push(this.formatIcon(t.getIcon("pinned"),"orders:pinned")),e.push('<span class="planning-mrp-list-property planning-mrp-list-property-psStatus" title="'+n("planning","orders:psStatus:"+a)+'" data-ps-status="'+a+'"><i class="fa '+t.getIcon("psStatus")+'"></i></span>'),e.push('<span class="planning-mrp-list-property planning-mrp-list-property-whStatus" title="'+n("planning","orders:whStatus:"+d)+'" data-wh-status="'+d+'"><i class="fa '+t.getIcon("whStatus")+'"></i></span>'),r.statuses.indexOf("CNF")!==-1&&e.push(o("CNF")),r.statuses.indexOf("DLV")!==-1&&e.push(o("DLV")),e.join("")},formatIcon:function(e,r){return'<span class="planning-mrp-list-property" title="'+t.escape(n("planning",r))+'"><i class="fa '+e+'"></i></span>'},hideMenu:function(){p.hide(this)},showMenu:function(t){var e=t.currentTarget.dataset.id,r=[p.actions.sapOrder(e)];(this.plan.shiftOrders.findOrders(e).length||this.plan.getActualOrderData(e).quantityDone)&&r.push({icon:"fa-file-text-o",label:n("planning","orders:menu:shiftOrder"),handler:this.handleShiftOrderAction.bind(this,e)}),this.plan.canCommentOrders()&&r.push(p.actions.comment(e)),r.push({icon:"fa-clipboard",label:n("planning","lineOrders:menu:copy"),handler:this.handleCopyAction.bind(this,t.currentTarget,t.pageY,t.pageX)}),this.plan.canChangeDropZone()&&r.push({icon:"fa-level-down",label:n("planning","orders:menu:dropZone"),handler:this.handleDropZoneAction.bind(this,e)}),p.show(this,t.pageY,t.pageX,r)},handleShiftOrderAction:function(t){var e=this.plan.shiftOrders.findOrders(t);return 1===e.length?window.open("/#prodShiftOrders/"+e[0].id):void window.open("/#prodShiftOrders?sort(startedAt)&limit(20)&orderId="+t)},handleCopyAction:function(t,e,r){var i=this;a.copy(function(s){if(s){var a=["no","shift","orderNo","nc12","name","qtyPlan","qtyTodo","startTime","finishTime","lines","comment"],o=[a.map(function(t){return n("planning","lineOrders:list:"+t)}).join("\t")];i.serializeOrders().forEach(function(t){var e=[t.no,t.shift,t.orderNo,t.nc12,t.name,t.qtyPlan,t.qtyTodo,t.startTime,t.finishTime,t.lines,'"'+t.comments.map(function(t){return t.user.label+": "+t.text.replace(/"/g,"'")}).join("\r\n--\r\n")+'"'];o.push(e.join("\t"))}),s.setData("text/plain",o.join("\r\n"));var d=i.$(t).tooltip({container:i.el,trigger:"manual",placement:"bottom",title:n("planning","lineOrders:menu:copy:success")});d.tooltip("show").data("bs.tooltip").tip().addClass("result success").css({left:r+"px",top:e+"px"}),i.timers.hideTooltip&&clearTimeout(i.timers.hideTooltip),i.timers.hideTooltip=setTimeout(function(){d.tooltip("destroy")},1337)}})},handleDropZoneAction:function(t){var e=new h({plan:this.plan,mrp:this.mrp,order:this.plan.orders.get(t)});i.showDialog(e,n("planning","orders:menu:dropZone:title"))},onOrderHighlight:function(t){if("lineOrders"!==t.source&&this.mrp.orders.get(t.orderNo)){var e=this.$('tr[data-id="'+t.orderNo+'"]').toggleClass("is-highlighted",t.state)[0];e&&!this.expanded&&(this.el.scrollTop=e.offsetTop)}},onCommentChange:function(t){this.mrp.orders.get(t.id)&&this.$('tr[data-id="'+t.id+'"] > .planning-mrp-lineOrders-comment').html(t.getCommentWithIcon())},onSapOrdersReset:function(t,e){e.reload||!this.plan.displayOptions.isLatestOrderDataUsed()||this.plan.isAnythingLoading()||this.render()},onPsStatusChanged:function(t){var e=this.$('tr[data-id="'+t.id+'"]');if(e.length){var r=this.plan.sapOrders.getPsStatus(t.id);e.find(".planning-mrp-list-property-psStatus").attr("title",n("planning","orders:psStatus:"+r)).attr("data-ps-status",r)}},onWhStatusChanged:function(t){var e=this.$('tr[data-id="'+t.id+'"]');if(e.length){var r=this.plan.sapOrders.getWhStatus(t.id);e.find(".planning-mrp-list-property-whStatus").attr("title",n("planning","orders:whStatus:"+r)).attr("data-wh-status",r)}},onWhDropZoneChanged:function(t){var e=this.$('tr[data-id="'+t.id+'"]');e.length&&e.find(".planning-mrp-lineOrders-dropZone").html(t.getDropZone())}})});