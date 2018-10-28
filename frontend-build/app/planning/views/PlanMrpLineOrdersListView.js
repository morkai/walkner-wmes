define(["underscore","jquery","app/i18n","app/time","app/viewport","app/core/View","app/data/clipboard","../util/shift","../util/contextMenu","../PlanSapOrder","./PlanOrderDropZoneDialogView","app/core/templates/userInfo","app/planning/templates/lineOrdersList","app/planning/templates/lineOrderComments","app/planning/templates/orderStatusIcons"],function(t,e,n,i,r,s,o,a,d,l,p,h,c,m,u){"use strict";return s.extend({template:c,events:{"mouseenter tbody > tr":function(t){this.mrp.orders.trigger("highlight",{source:"lineOrders",state:!0,orderNo:t.currentTarget.dataset.id})},"mouseleave tbody > tr":function(t){this.mrp.orders.trigger("highlight",{source:"lineOrders",state:!1,orderNo:t.currentTarget.dataset.id})},"contextmenu tbody > tr":function(t){return this.showMenu(t),!1},"dblclick tr":function(t){if("wh"!==this.options.mode){window.getSelection().removeAllRanges();var e=t.currentTarget,n=e.dataset.index,i=t.clientY-t.currentTarget.getBoundingClientRect().top;this.$el.toggleClass("is-expanded"),this.expanded=this.$el.hasClass("is-expanded"),this.expanded?window.scrollTo(0,window.scrollY+e.getBoundingClientRect().top-t.clientY+i):n>=10&&(window.scrollTo(0,this.$el.closest(".planning-mrp")[0].offsetTop),t.currentTarget.scrollIntoView({block:"center"}),window.scrollBy(0,-1*(t.clientY-e.getBoundingClientRect().top-i)))}},"mousedown .planning-mrp-lineOrders-comment":function(t){if(0===t.button){var e=this.plan.sapOrders.get(t.currentTarget.parentNode.dataset.id);if(e){var n=e.get("comments");n.length&&this.$(t.currentTarget).popover({trigger:"manual",placement:"left",html:!0,content:m({comments:n.map(function(t){return{user:h({noIp:!0,userInfo:t.user}),time:i.toTagData(t.time).human,text:l.formatCommentWithIcon(t)}})}),template:'<div class="popover planning-mrp-comment-popover"><div class="arrow"></div><div class="popover-content"></div></div>'}).popover("show")}}},"mouseup .planning-mrp-lineOrders-comment":function(t){this.$(t.currentTarget).popover("destroy")},"click .planning-mrp-lineOrders-dropZone":function(t){this.handleDropZoneAction(this.$(t.target).closest("tr").attr("data-id"))}},initialize:function(){this.expanded="wh"===this.options.mode,this.listenTo(this.mrp.lines,"reset added changed removed",this.renderIfNotLoading),this.listenTo(this.mrp.orders,"highlight",this.onOrderHighlight),this.listenTo(this.plan.sapOrders,"change:comments",this.onCommentChange),this.listenTo(this.plan.sapOrders,"reset",this.onSapOrdersReset),this.listenTo(this.plan.sapOrders,"change:psStatus",this.onPsStatusChanged),this.listenTo(this.plan.sapOrders,"change:whStatus",this.onWhStatusChanged),this.listenTo(this.plan.sapOrders,"change:whDropZone change:whTime",this.onWhDropZoneChanged)},serialize:function(){var t="wh"===this.options.mode;return{idPrefix:this.idPrefix,expanded:this.expanded,orders:this.serializeOrders(),hiddenColumns:{finishTime:t,lines:t}}},renderIfNotLoading:function(){this.plan.isAnythingLoading()||this.render()},serializeOrders:function(){var e=this,n=e.plan.sapOrders,r=e.mrp,s={},o="wh"===e.options.mode;return r.lines.forEach(function(t){t.orders.forEach(function(i){var a=i.get("orderNo"),d=r.orders.get(a);if(d){var l=n.get(a),p=s[a];p||(p=s[a]={orderNo:d.id,nc12:d.get("nc12"),name:d.get("name"),startTime:Number.MAX_VALUE,finishTime:0,qtyTodo:d.get("quantityTodo"),qtyPlan:0,lines:{},comment:l?l.getCommentWithIcon():"",comments:l?l.get("comments"):[],status:d.getStatus(),statuses:e.serializeOrderStatuses(d),dropZone:l?l.getDropZone():"",rowClassName:o&&l&&"done"===l.get("whStatus")?"success":""}),p.qtyPlan+=i.get("quantity");var h=Date.parse(i.get("startAt"));h<p.startTime&&(p.startTime=h);var c=Date.parse(i.get("finishAt"));c>p.finishTime&&(p.finishTime=c),p.lines[t.id]||(p.lines[t.id]=0),p.lines[t.id]+=i.get("quantity")}})}),t.values(s).sort(function(t,e){return t.startTime-e.startTime}).map(function(e,n){return e.no=n+1,e.shift=a.getShiftNo(e.startTime),e.startTime=i.utc.format(e.startTime,"HH:mm:ss"),e.finishTime=i.utc.format(e.finishTime,"HH:mm:ss"),e.lines=t.map(e.lines,function(t,e){return e+" ("+t+")"}).join("; "),e})},serializeOrderStatuses:function(t){return u(this.plan,t.id)},formatIcon:function(e,i){return'<span class="planning-mrp-list-property" title="'+t.escape(n("planning",i))+'"><i class="fa '+e+'"></i></span>'},hideMenu:function(){d.hide(this)},showMenu:function(t){var e=t.currentTarget.dataset.id,i=[d.actions.sapOrder(e)];(this.plan.shiftOrders.findOrders(e).length||this.plan.getActualOrderData(e).quantityDone)&&i.push({icon:"fa-file-text-o",label:n("planning","orders:menu:shiftOrder"),handler:this.handleShiftOrderAction.bind(this,e)}),this.plan.canCommentOrders()&&i.push(d.actions.comment(e)),i.push({icon:"fa-clipboard",label:n("planning","lineOrders:menu:copy"),handler:this.handleCopyAction.bind(this,t.currentTarget,t.pageY,t.pageX)}),this.plan.canChangeDropZone()&&i.push({icon:"fa-level-down",label:n("planning","orders:menu:dropZone"),handler:this.handleDropZoneAction.bind(this,e)}),d.show(this,t.pageY,t.pageX,i)},handleShiftOrderAction:function(t){var e=this.plan.shiftOrders.findOrders(t);if(1===e.length)return window.open("/#prodShiftOrders/"+e[0].id);window.open("/#prodShiftOrders?sort(startedAt)&limit(20)&orderId="+t)},handleCopyAction:function(t,e,i){var r=this;o.copy(function(s){if(s){var o=[["no","shift","orderNo","nc12","name","qtyPlan","qtyTodo","startTime","finishTime","dropZone","lines","comment"].map(function(t){return n("planning","lineOrders:list:"+t)}).join("\t")];r.serializeOrders().forEach(function(t){var e=[t.no,t.shift,t.orderNo,t.nc12,t.name,t.qtyPlan,t.qtyTodo,t.startTime,t.finishTime,t.dropZone,t.lines,'"'+t.comments.map(function(t){return t.user.label+": "+t.text.replace(/"/g,"'")}).join("\r\n--\r\n")+'"'];o.push(e.join("\t"))}),s.setData("text/plain",o.join("\r\n"));var a=r.$(t).tooltip({container:r.el,trigger:"manual",placement:"bottom",title:n("planning","lineOrders:menu:copy:success")});a.tooltip("show").data("bs.tooltip").tip().addClass("result success").css({left:i+"px",top:e+"px"}),r.timers.hideTooltip&&clearTimeout(r.timers.hideTooltip),r.timers.hideTooltip=setTimeout(function(){a.tooltip("destroy")},1337)}})},handleDropZoneAction:function(t){var e=new p({plan:this.plan,mrp:this.mrp,order:this.plan.orders.get(t)});r.showDialog(e,n("planning","orders:menu:dropZone:title"))},onOrderHighlight:function(t){if("lineOrders"!==t.source&&this.mrp.orders.get(t.orderNo)){var e=this.$('tr[data-id="'+t.orderNo+'"]').toggleClass("is-highlighted",t.state)[0];e&&!this.expanded&&(this.el.scrollTop=e.offsetTop)}},onCommentChange:function(t){this.mrp.orders.get(t.id)&&this.$('tr[data-id="'+t.id+'"] > .planning-mrp-lineOrders-comment').html(t.getCommentWithIcon())},onSapOrdersReset:function(t,e){e.reload||!this.plan.displayOptions.isLatestOrderDataUsed()||this.plan.isAnythingLoading()||this.render()},onPsStatusChanged:function(t){var e=this.$('tr[data-id="'+t.id+'"]');if(e.length){var i=this.plan.sapOrders.getPsStatus(t.id);e.find(".planning-mrp-list-property-psStatus").attr("title",n("planning","orders:psStatus:"+i)).attr("data-ps-status",i)}},onWhStatusChanged:function(t){var e=this.$('tr[data-id="'+t.id+'"]');if(e.length){var i=this.plan.sapOrders.getWhStatus(t.id);e.toggleClass("success","wh"===this.options.mode&&"done"===i).find(".planning-mrp-list-property-whStatus").attr("title",n("planning","orders:whStatus:"+i)).attr("data-wh-status",i)}},onWhDropZoneChanged:function(t){var e=this.$('tr[data-id="'+t.id+'"]');e.length&&e.find(".planning-mrp-lineOrders-dropZone").html(t.getDropZone())}})});