define(["underscore","jquery","app/i18n","app/user","app/viewport","app/core/View","app/planning/util/contextMenu","./PaintShopOrderDetailsView","app/paintShop/templates/queue","app/paintShop/templates/queueOrder"],function(e,t,i,s,r,o,n,d,a,l){"use strict";return o.extend({template:a,events:{"mousedown .paintShop-order":function(e){this.lastClickEvent=e,this.options.embedded&&(this.timers.showMenu&&clearTimeout(this.timers.showMenu),this.timers.showMenu=setTimeout(this.showMenu.bind(this,e),300))},"mouseup .paintShop-order":function(e){if(!this.options.embedded||this.timers.showMenu){clearTimeout(this.timers.showMenu),this.timers.showMenu=null;var t=this.lastClickEvent;this.lastClickEvent=null,t&&0===e.button&&""===window.getSelection().toString()&&(window.parent===window||t.offsetY===e.offsetY&&t.offsetX===e.offsetX&&t.screenX===e.screenX&&t.screenY===e.screenY)&&this.handleOrderClick(e.currentTarget.dataset.orderId,this.$(e.target).closest("td")[0].dataset.property)}},"contextmenu .visible":function(e){return this.showMenu(e),!1}},initialize:function(){this.onScroll=e.debounce(this.onScroll.bind(this),100,!1),this.lastClickEvent=null,this.lastFocusedOrder=null,this.listenTo(this.orders,"reset",e.after(2,this.render)),this.listenTo(this.orders,"change",this.onChange),this.listenTo(this.orders,"focus",this.onFocus),this.listenTo(this.orders,"mrpSelected paintSelected",this.toggleVisibility),this.listenTo(this.orders,"paintSelected",this.toggleChildOrderDropZones),this.listenTo(this.dropZones,"updated",this.onDropZoneUpdated)},getTemplateData:function(){var e=this,t=null,i=null,s=e.orders.getChildOrderDropZoneClass.bind(e.orders),r=e.orders.serialize().map(function(r){return(r={order:r,visible:e.orders.isVisible(r),first:!1,last:!1,commentVisible:!0,rowSpan:"rowSpan",mrpDropped:e.dropZones.getState(r.mrp),getChildOrderDropZoneClass:s}).visible&&(t||(t=r),i=r),r});return t&&(t.first=!0),i&&(i.last=!0),{orders:r,renderQueueOrder:l}},afterRender:function(){var e=this.$order(this.lastFocusedOrder);e.length&&(this.el.parentNode.scrollTop=e[0].offsetTop+1)},$order:function(e){return this.$('.paintShop-order[data-order-id="'+e+'"]')},handleOrderClick:function(e,t){if(!r.currentDialog){var i=this.orders.get(e);if(i){var s=i.get("followups");if(!s.length||"no"!==t&&"order"!==t){var o=this.$order(e)[0];o&&(this.$el.parent().animate({scrollTop:o.offsetTop+1},200),this.lastFocusedOrder=e);var n=new d({model:i,orders:this.orders,dropZones:this.dropZones,height:o?o.clientHeight:0,vkb:this.options.vkb});r.showDialog(n)}else this.onFocus(s[0])}}},showMenu:function(e){this.timers.showMenu&&(clearTimeout(this.timers.showMenu),this.timers.showMenu=null);var t=this.orders.get(e.currentTarget.dataset.orderId),r=t.get("order"),o=t.get("mrp"),d=[t.get("order"),{icon:"fa-print",label:i("paintShop","menu:printOrder"),handler:this.trigger.bind(this,"actionRequested","printOrders","order",r)},{icon:"fa-clipboard",label:i("paintShop","menu:copyOrder"),handler:this.trigger.bind(this,"actionRequested","copyOrders",e,r),visible:!this.options.embedded},{label:i("paintShop","menu:copyChildOrders"),handler:this.trigger.bind(this,"actionRequested","copyChildOrders",e,r),visible:!this.options.embedded},"-",i("paintShop","menu:header:mrp",{mrp:o}),{icon:"fa-clipboard",label:i("paintShop","menu:copyOrders"),handler:this.trigger.bind(this,"actionRequested","copyOrders",e,o),visible:!this.options.embedded},{label:i("paintShop","menu:copyChildOrders"),handler:this.trigger.bind(this,"actionRequested","copyChildOrders",e,o),visible:!this.options.embedded},{icon:"fa-print",label:i("paintShop","menu:printOrders"),handler:this.trigger.bind(this,"actionRequested","printOrders","mrp",o)},{icon:"fa-download",label:i("paintShop","menu:exportOrders"),handler:this.trigger.bind(this,"actionRequested","exportOrders",o),visible:!this.options.embedded}];s.isAllowedTo("PAINT_SHOP:DROP_ZONES")&&d.push({icon:"fa-level-down",label:i("paintShop","menu:dropZone:"+this.dropZones.getState(o)),handler:this.trigger.bind(this,"actionRequested","dropZone",o,!1)}),d.push("-",i("paintShop","menu:header:all"),{icon:"fa-clipboard",label:i("paintShop","menu:copyOrders"),handler:this.trigger.bind(this,"actionRequested","copyOrders",e,null),visible:!this.options.embedded},{icon:"fa-clipboard",label:i("paintShop","menu:copyChildOrders"),handler:this.trigger.bind(this,"actionRequested","copyChildOrders",e,null),visible:!this.options.embedded},{icon:"fa-print",label:i("paintShop","menu:printOrders"),handler:this.trigger.bind(this,"actionRequested","printOrders",null,null)},{icon:"fa-download",label:i("paintShop","menu:exportOrders"),handler:this.trigger.bind(this,"actionRequested","exportOrders",null),visible:!this.options.embedded}),s.isAllowedTo("PAINT_SHOP:DROP_ZONES")&&"all"!==this.orders.selectedPaint&&d.push({icon:"fa-level-down",label:i("paintShop","menu:dropZone:"+this.dropZones.getState(this.orders.selectedPaint)),handler:this.trigger.bind(this,"actionRequested","dropZone",this.orders.selectedPaint,!0)}),n.show(this,e.pageY,e.pageX,d)},hideMenu:function(){n.hide(this)},toggleVisibility:function(){var e=this.orders;this.$(".paintShop-order").each(function(){var t=e.get(this.dataset.orderId).serialize(),i=!e.isVisible(t);this.classList.toggle("hidden",i),this.classList.toggle("visible",!i)}),this.$(".paintShop-order.is-first, .paintShop-order.is-last").removeClass("is-first is-last");var t=this.$(".visible");t.first().addClass("is-first"),t.last().addClass("is-last"),this.el.scrollTop=0},toggleChildOrderDropZones:function(){var e=this;e.$(".paintShop-childOrder-dropZone").each(function(){this.classList.remove("is-dropped","is-undroppable","is-droppable");var t=e.orders.get(this.dataset.orderId);if(t){var i=(t=t.serialize()).childOrders[this.dataset.childOrderIndex];if(i){var s=e.orders.getChildOrderDropZoneClass(i,t);s&&this.classList.add(s)}}})},onScroll:function(){var e=this.$(".visible");if(e.length){this.lastFocusedOrder=e[0].dataset.orderId;for(var t=this.el.parentNode.scrollTop,i=0;i<e.length;++i){var s=e[i];if(s.offsetTop>t)break;this.lastFocusedOrder=s.dataset.orderId,t>s.offsetTop+26&&e[i+1]&&(this.lastFocusedOrder=e[i+1].dataset.orderId)}}},onChange:function(e){var t=this.$order(e.id),i=e.serialize();t.replaceWith(l({order:i,visible:this.orders.isVisible(i),first:t.hasClass("is-first"),last:t.hasClass("is-last"),commentVisible:!0,rowSpan:"rowSpan",mrpDropped:this.dropZones.getState(i.mrp),getChildOrderDropZoneClass:this.orders.getChildOrderDropZoneClass.bind(this.orders)}))},onFocus:function(e,t){var i=this.$order(e)[0];i?(this.$el.parent().animate({scrollTop:i.offsetTop+1},200),this.lastFocusedOrder=e,t&&t.showDetails&&this.handleOrderClick(e)):this.handleOrderClick(e)},onDropZoneUpdated:function(e){var t=e.get("mrp"),i=e.get("state"),s=this.$('.paintShop-property-mrp[data-mrp="'+t+'"]');s.length?s.toggleClass("is-dropped",i):this.toggleChildOrderDropZones()}})});