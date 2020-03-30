define(["underscore","jquery","app/user","app/viewport","app/core/View","app/data/clipboard","../WiringOrderCollection","app/wmes-wiring/templates/list","app/wmes-wiring/templates/listRow","app/wmes-wiring/templates/action","jquery.stickytableheaders"],function(t,e,i,r,s,o,n,a,d,c){"use strict";return s.extend({template:a,events:{"click td":function(t){var e=t.currentTarget,r=e.dataset.popover;if(this.$popover&&this.$popover[0]===e&&this.$popover.data("sticky"))this.hidePopover();else if(this.hidePopover(!0),r){var s=(r=r.split(" ")).join("\n");"leadingOrders"===e.dataset.columnId&&i.isAllowedTo("ORDERS:VIEW")&&(r=r.map(function(t){return'<a href="#orders/'+t+'" target="_blank">'+t+"</a>"})),this.$popover=this.$(e).popover({container:document.body,placement:"right",trigger:"manual",html:!0,content:r.join(", ")}),this.$popover.data("sticky",!0).data("clipboard",s).popover("show")}},"mouseenter td":function(t){var e=t.currentTarget;if(!this.$popover||this.$popover[0]!==e){var i=e.dataset.popover;i&&-1!==i.indexOf(" ")&&(this.hidePopover(),this.$popover=this.$(e).popover({container:document.body,placement:"right",trigger:"manual",content:i.replace(/ /g,", ")}),this.$popover.data("sticky",!1).data("clipboard",i.replace(/ /g,"\n")).popover("show"))}},"mouseleave td":function(){this.$popover&&!this.$popover.data("sticky")&&this.hidePopover()},"click .btn":function(t){this.handleAction(t.currentTarget.dataset.action,this.$(t.target).closest("tr")[0].dataset.nc12)}},modelProperty:"orders",initialize:function(){this.lastNc12=null,this.lastColumnId=null,this.renderRow=this.renderPartialHtml.bind(this,d),this.once("afterRender",this.defineBindings)},destroy:function(){e(window).off("keydown."+this.idPrefix),this.$(".table").stickyTableHeaders("destroy"),this.hidePopover(!0)},defineBindings:function(){this.listenTo(this.orders,"reset add remove filter:status filter:mrp",t.debounce(this.render.bind(this),1)),this.listenTo(this.orders,"change",this.onChange),e(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this)).on("click."+this.idPrefix,this.onMouseClick.bind(this))},getTemplateData:function(){return{canUpdate:this.orders.canUpdate(),renderRow:this.renderRow,filters:this.orders.filters,rows:this.serializeRows(null)}},serializeRows:function(e){var i=this,r=i.orders.filters,s={},o={};i.orders.serialize().forEach(function(t){e&&t.nc12!==e||"all"!==r.mrp&&t.mrp!==r.mrp||r.order&&-1===t.leadingOrders.indexOf(r.order)||(s[t.nc12]||(s[t.nc12]=[]),s[t.nc12].push(t))}),t.forEach(s,function(e){var r=!0;e.forEach(function(t){r=r&&"cancelled"===t.status}),e.forEach(function(e){var s=o[e.nc12];s?(s.status=i.resolveStatus(s.status,e.status),("cancelled"!==e.status||r)&&(s.qty+=e.qty),s.qtyDone+=e.qtyDone,(!s.startedAt||e.startedAt<s.startedAt)&&(s.startedAt=e.startedAt),(!s.finishedAt||e.finishedAt>s.finishedAt)&&(s.finishedAt=e.finishedAt),s.actionInProgress||(s.actionInProgress=e.actionInProgress)):((s=o[e.nc12]=t.clone(e)).mrps={},s.childOrders={},s.leadingOrders={},"cancelled"!==e.status||r||(s.qty=0)),Object.assign(s.childOrders,e.childOrders),e.mrps.forEach(function(t){s.mrps[t]=1}),e.leadingOrders.forEach(function(t){s.leadingOrders[t]=1})})});var n=[];return t.forEach(o,function(e){r.status.length&&!t.includes(r.status,e.status)||(e.mrps=Object.keys(e.mrps).sort(),e.leadingOrders=Object.keys(e.leadingOrders).sort(),e.childOrder=e.childOrders[r.order],n.push(e))}),n},resolveStatus:function(t,e){if(t===e)return t;var i=[t,e].sort(function(t,e){return n.STATUS_ORDERS[t]-n.STATUS_ORDERS[e]});return t=i[0],e=i[1],"new"===t?"cancelled"===e?t:"started"===e?e:"partial":t},beforeRender:function(){this.hidePopover(!0)},afterRender:function(){this.$(".table").stickyTableHeaders({fixedOffset:e(".navbar-fixed-top")})},onChange:function(t){var i=t.get("nc12"),r=this.serializeRows(i),s=this.$('.wiring-list-item[data-nc12="'+i+'"]');if(r.length){var o=this.renderRow({canUpdate:this.orders.canUpdate(),filters:this.orders.filters,row:r[0]});s.length?s.replaceWith(o):e(o).css({display:"none"}).appendTo(this.$("tbody")).fadeIn("fast")}else s.fadeOut("fast",function(){s.remove()})},onKeyDown:function(t){if(t.ctrlKey&&"C"===t.key.toUpperCase()&&this.handleCopy(t),"Escape"===t.key){this.hidePopover(),this.hideEditor();var e=Date.now();this.lastEscapeAt&&e-this.lastEscapeAt<500&&(this.orders.setStatusFilter([]),this.orders.setMrpFilter("all")),this.lastEscapeAt=e}},onMouseClick:function(t){var i=e(t.target);i.closest(".wiring-list-editor-popover").length||i.closest(".actions").length||this.hideEditor()},handleCopy:function(t){if(""===window.getSelection().toString()&&this.$popover){t.preventDefault();var e=this.$popover[0].dataset.columnId,i=this.$popover.data("clipboard").replace(/ /g,"\n");this.copyProp(e,i)}},copyProp:function(t,e){var i=this;o.copy(function(s){s.setData("text/plain",e),i.$clipboardMsg&&r.msg.hide(i.$clipboardMsg,!0),i.$clipboardMsg=r.msg.show({type:"info",time:1500,text:i.t("msg:clipboard:"+t)})})},hidePopover:function(t){if(this.$popover){var e=this.$popover.data("bs.popover");t&&e&&e.tip().removeClass("fade"),this.$popover.popover("destroy").removeData("sticky"),this.$popover=null}},handleAction:function(t,e){switch(this.hideEditor(),t){case"start":this.act(t,e);break;case"continue":case"cancel":case"reset":case"finish":this.showActionPopover(t,e)}},hideEditor:function(){var t=e(".wiring-list-editor-popover");t.length&&this.$('.btn[aria-describedby="'+t[0].id+'"]').popover("destroy")},showActionPopover:function(t,e){var i=this,r=i.serializeRows(e)[0];if(r){var s=i.$('.wiring-list-item[data-nc12="'+e+'"]').find('.btn[data-action="'+t+'"]');s.popover({container:document.body,placement:"right",trigger:"manual",html:!0,title:function(){return""},content:this.renderPartialHtml(c,{action:t,qtyDone:r.qtyDone<r.qty?r.qty:r.qtyDone===r.qty?0:r.qtyDone,qty:r.qty}),className:"wiring-list-editor-popover"}),s.popover("show");var o=s.data("bs.popover").tip().find("form");o.on("submit",function(){return i.hideEditor(),i.act(t,e,o.find(".form-control").val()||""),!1}),o.find(".btn-danger").on("click",function(){i.hideEditor()}),"finish"===t?o.find(".form-control").select():o.find(".btn-success").focus()}},act:function(t,e,i){var s="finish"===t;if(!s||i){r.msg.saving();var o=this.orders.filters.mrp,n=this.orders.filter(function(t){return t.get("nc12")===e&&("all"===o||t.get("mrp")===o)}),a=0;n.forEach(function(t){a+=t.get("qtyDone")}),s&&(i=("+"===i.charAt(0)?a:0)+parseInt(i,10));var d=[];n.forEach(function(e,r){var o;if(s){var a=e.get("qty");o=r+1===n.length?i>=0?i:0:i>0?i>=a?a:i:0,i-=a}else if(n.length>1){var c=e.get("status");if("continue"===t&&"finished"===c)return;if("reset"!==t&&"cancelled"===c)return}d.push({action:t,orderId:e.id,qtyDone:o}),e.set("actionInProgress",t)}),d.length&&this.actNext(e,d)}},actNext:function(t,e){var i=this,s=e.shift();i.orders.act(s,function(o){var n=i.orders.get(s.orderId);n&&n.set("actionInProgress",null),o?r.msg.savingFailed():e.length?i.actNext(t,e):r.msg.saved()})}})});