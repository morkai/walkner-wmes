// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/viewport","app/core/View","./PaintShopOrderDetailsView","app/paintShop/templates/queue","app/paintShop/templates/queueOrder"],function(e,t,s,i,r,o,l,n){"use strict";return r.extend({template:l,events:{"mousedown .paintShop-order":function(e){this.lastClickEvent=e},"mouseup .paintShop-order":function(e){var t=this.lastClickEvent;this.lastClickEvent=null,t&&0===e.button&&""===window.getSelection().toString()&&(window.parent===window||t.offsetY===e.offsetY&&t.offsetX===e.offsetX&&t.screenX===e.screenX&&t.screenY===e.screenY)&&this.handleOrderClick(e.currentTarget.dataset.orderId,this.$(e.target).closest("td")[0].dataset.property)},scroll:"onScroll"},initialize:function(){this.lastClickEvent=null,this.lastFocusedOrder=null,this.onScroll=e.debounce(this.onScroll.bind(this),100,!1),this.listenTo(this.model,"reset",this.render),this.listenTo(this.model,"change",this.onChange),this.listenTo(this.model,"focus",this.onFocus),this.listenTo(this.model,"mrpSelected",this.onMrpSelected)},serialize:function(){var e=null,t=null,s=this.model.selectedMrp,i=this.model.serialize().map(function(i){return i={order:i,visible:"all"===s||i.mrp===s,first:!1,last:!1,commentVisible:!0},i.visible&&(e||(e=i),t=i),i});return e&&(e.first=!0),t&&(t.last=!0),{idPrefix:this.idPrefix,orders:i,renderQueueOrder:n}},afterRender:function(){var e=this.$order(this.lastFocusedOrder);e.length&&(this.el.scrollTop=e[0].offsetTop+1)},$order:function(e){return this.$('.paintShop-order[data-order-id="'+e+'"]')},handleOrderClick:function(e,t){if(!i.currentDialog){var s=this.model.get(e);if(s){var r=s.get("followups");if(r.length&&("no"===t||"order"===t))return void this.onFocus(r[0]);var l=this.$order(e)[0];l&&(this.$el.animate({scrollTop:l.offsetTop+1},200),this.lastFocusedOrder=e);var n=new o({model:s,height:l?l.clientHeight:0,vkb:this.options.vkb});i.showDialog(n)}}},onScroll:function(){var e=this.$(".visible");if(e.length){this.lastFocusedOrder=e[0].dataset.orderId;for(var t=this.el.scrollTop,s=0;s<e.length;++s){var i=e[s];if(i.offsetTop>t)break;this.lastFocusedOrder=i.dataset.orderId,t>i.offsetTop+26&&e[s+1]&&(this.lastFocusedOrder=e[s+1].dataset.orderId)}}},onChange:function(e){var t=this.$order(e.id);t.replaceWith(n({order:e.serialize(),visible:this.model.isVisible(e),first:t.hasClass("is-first"),last:t.hasClass("is-last"),commentVisible:!0}))},onFocus:function(e){var t=this.$order(e)[0];t?(this.$el.animate({scrollTop:t.offsetTop+1},200),this.lastFocusedOrder=e):this.handleOrderClick(e)},onMrpSelected:function(){var e=this.model.selectedMrp,t="all"!==e;this.$(".paintShop-order").each(function(){var s=t&&this.dataset.mrp!==e;this.classList.toggle("hidden",s),this.classList.toggle("visible",!s)}),this.$(".paintShop-order.is-first, .paintShop-order.is-last").removeClass("is-first is-last");var s=this.$(".visible");s.first().addClass("is-first"),s.last().addClass("is-last"),this.el.scrollTop=0}})});