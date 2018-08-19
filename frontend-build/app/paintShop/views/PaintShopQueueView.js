// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/user","app/viewport","app/core/View","app/planning/util/contextMenu","./PaintShopOrderDetailsView","app/paintShop/templates/queue","app/paintShop/templates/queueOrder"],function(e,t,r,i,s,o,n,d,a,l){"use strict";return o.extend({template:a,events:{"mousedown .paintShop-order":function(e){this.lastClickEvent=e},"mouseup .paintShop-order":function(e){var t=this.lastClickEvent;this.lastClickEvent=null,t&&0===e.button&&""===window.getSelection().toString()&&(window.parent===window||t.offsetY===e.offsetY&&t.offsetX===e.offsetX&&t.screenX===e.screenX&&t.screenY===e.screenY)&&this.handleOrderClick(e.currentTarget.dataset.orderId,this.$(e.target).closest("td")[0].dataset.property)},"contextmenu .visible":function(e){return this.showMenu(e),!1}},initialize:function(){this.onScroll=e.debounce(this.onScroll.bind(this),100,!1),this.lastClickEvent=null,this.lastFocusedOrder=null,this.listenTo(this.orders,"reset",e.after(2,this.render)),this.listenTo(this.orders,"change",this.onChange),this.listenTo(this.orders,"focus",this.onFocus),this.listenTo(this.orders,"mrpSelected paintSelected",this.toggleVisibility),this.listenTo(this.orders,"paintSelected",this.toggleChildOrderDropZones),this.listenTo(this.dropZones,"updated",this.onDropZoneUpdated)},getTemplateData:function(){var e=this,t=null,r=null,i=e.orders.getChildOrderDropZoneClass.bind(e.orders),s=e.orders.serialize().map(function(s){return s={order:s,visible:e.orders.isVisible(s),first:!1,last:!1,commentVisible:!0,rowSpan:"rowSpan",mrpDropped:e.dropZones.getState(s.mrp),getChildOrderDropZoneClass:i},s.visible&&(t||(t=s),r=s),s});return t&&(t.first=!0),r&&(r.last=!0),{orders:s,renderQueueOrder:l}},afterRender:function(){var e=this.$order(this.lastFocusedOrder);e.length&&(this.el.parentNode.scrollTop=e[0].offsetTop+1)},$order:function(e){return this.$('.paintShop-order[data-order-id="'+e+'"]')},handleOrderClick:function(e,t){if(!s.currentDialog){var r=this.orders.get(e);if(r){var i=r.get("followups");if(i.length&&("no"===t||"order"===t))return void this.onFocus(i[0]);var o=this.$order(e)[0];o&&(this.$el.parent().animate({scrollTop:o.offsetTop+1},200),this.lastFocusedOrder=e);var n=new d({model:r,orders:this.orders,dropZones:this.dropZones,height:o?o.clientHeight:0,vkb:this.options.vkb});s.showDialog(n)}}},showMenu:function(e){var t=this.orders.get(e.currentTarget.dataset.orderId),s=t.get("order"),o=t.get("mrp"),d=[t.get("order"),{icon:"fa-print",label:r("paintShop","menu:printOrder"),handler:this.trigger.bind(this,"actionRequested","printOrders","order",s)},"-",r("paintShop","menu:header:mrp",{mrp:o}),{icon:"fa-clipboard",label:r("paintShop","menu:copyOrders"),handler:this.trigger.bind(this,"actionRequested","copyOrders",e,o)},{icon:"fa-clipboard",label:r("paintShop","menu:copyChildOrders"),handler:this.trigger.bind(this,"actionRequested","copyChildOrders",e,o)},{icon:"fa-print",label:r("paintShop","menu:printOrders"),handler:this.trigger.bind(this,"actionRequested","printOrders","mrp",o)},{icon:"fa-download",label:r("paintShop","menu:exportOrders"),handler:this.trigger.bind(this,"actionRequested","exportOrders",o)}];i.isAllowedTo("PAINT_SHOP:DROP_ZONES")&&d.push({icon:"fa-level-down",label:r("paintShop","menu:dropZone:"+this.dropZones.getState(o)),handler:this.trigger.bind(this,"actionRequested","dropZone",o,!1)}),d.push("-",r("paintShop","menu:header:all"),{icon:"fa-clipboard",label:r("paintShop","menu:copyOrders"),handler:this.trigger.bind(this,"actionRequested","copyOrders",e,null)},{icon:"fa-clipboard",label:r("paintShop","menu:copyChildOrders"),handler:this.trigger.bind(this,"actionRequested","copyChildOrders",e,null)},{icon:"fa-print",label:r("paintShop","menu:printOrders"),handler:this.trigger.bind(this,"actionRequested","printOrders",null,null)},{icon:"fa-download",label:r("paintShop","menu:exportOrders"),handler:this.trigger.bind(this,"actionRequested","exportOrders",null)}),i.isAllowedTo("PAINT_SHOP:DROP_ZONES")&&"all"!==this.orders.selectedPaint&&d.push({icon:"fa-level-down",label:r("paintShop","menu:dropZone:"+this.dropZones.getState(this.orders.selectedPaint)),handler:this.trigger.bind(this,"actionRequested","dropZone",this.orders.selectedPaint,!0)}),n.show(this,e.pageY,e.pageX,d)},hideMenu:function(){n.hide(this)},toggleVisibility:function(){var e=this.orders;this.$(".paintShop-order").each(function(){var t=e.get(this.dataset.orderId).serialize(),r=!e.isVisible(t);this.classList.toggle("hidden",r),this.classList.toggle("visible",!r)}),this.$(".paintShop-order.is-first, .paintShop-order.is-last").removeClass("is-first is-last");var t=this.$(".visible");t.first().addClass("is-first"),t.last().addClass("is-last"),this.el.scrollTop=0},toggleChildOrderDropZones:function(){var e=this;e.$(".paintShop-childOrder-dropZone").each(function(){this.classList.remove("is-dropped","is-undroppable","is-droppable");var t=e.orders.get(this.dataset.orderId);if(t){t=t.serialize();var r=t.childOrders[this.dataset.childOrderIndex];if(r){var i=e.orders.getChildOrderDropZoneClass(r,t);i&&this.classList.add(i)}}})},onScroll:function(){var e=this.$(".visible");if(e.length){this.lastFocusedOrder=e[0].dataset.orderId;for(var t=this.el.parentNode.scrollTop,r=0;r<e.length;++r){var i=e[r];if(i.offsetTop>t)break;this.lastFocusedOrder=i.dataset.orderId,t>i.offsetTop+26&&e[r+1]&&(this.lastFocusedOrder=e[r+1].dataset.orderId)}}},onChange:function(e){var t=this,r=t.$order(e.id),i=e.serialize();r.replaceWith(l({order:i,visible:t.orders.isVisible(i),first:r.hasClass("is-first"),last:r.hasClass("is-last"),commentVisible:!0,rowSpan:"rowSpan",mrpDropped:t.dropZones.getState(i.mrp),getChildOrderDropZoneClass:t.orders.getChildOrderDropZoneClass.bind(t.orders)}))},onFocus:function(e,t){var r=this.$order(e)[0];r?(this.$el.parent().animate({scrollTop:r.offsetTop+1},200),this.lastFocusedOrder=e,t&&t.showDetails&&this.handleOrderClick(e)):this.handleOrderClick(e)},onDropZoneUpdated:function(e){var t=e.get("mrp"),r=e.get("state"),i=this.$('.paintShop-property-mrp[data-mrp="'+t+'"]');i.length?i.toggleClass("is-dropped",r):this.toggleChildOrderDropZones()}})});