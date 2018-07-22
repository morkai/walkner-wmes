// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/user","app/viewport","app/core/View","app/core/views/PaginationView","./KanbanPrintQueueListItemView","app/kanbanPrintQueues/templates/list"],function(t,i,e,n,s,o,r,a,l){"use strict";return o.extend({template:l,events:{},initialize:function(){this.lastSpaceAt=0,this.defineModels(),this.defineViews(),this.defineBindings(),this.setView("#-pagination",this.paginationView)},destroy:function(){i(window).off("."+this.idPrefix)},defineModels:function(){},defineViews:function(){this.paginationView=new r({replaceUrl:!1,model:this.collection.paginationData})},defineBindings:function(){i(window).on("keydown."+this.idPrefix,this.onWindowKeyDown.bind(this)).on("keyup."+this.idPrefix,this.onWindowKeyUp.bind(this)),this.listenTo(this.collection,"reset",this.render),this.listenTo(this.collection,"add",this.onAdd),this.listenTo(this.collection,"print:next",this.printNext),this.listenTo(this.collection,"print:specific",this.printSpecific),this.listenTo(this.collection.paginationData,"change:page",this.scrollTop)},beforeRender:function(){var t=this;t.removeView("#-items"),t.collection.forEach(function(i){t.insertView("#-items",new a({model:i}))})},afterRender:function(){},refreshCollectionNow:function(){this.promised(this.collection.fetch({reset:!0}))},scrollTop:function(){var t=this.$el.offset().top-14,e=i(".navbar-fixed-top");e.length&&(t-=e.outerHeight()),window.scrollY>t&&i("html, body").stop(!0,!1).animate({scrollTop:t})},printNext:function(){if(n.isAllowedTo("KANBAN:PRINT","KANBAN:MANAGE")){var i=this.$(".is-expanded");if(!i.length)return s.msg.show({type:"warning",time:2500,text:this.t("msg:printNext:expand")});var e=this.collection.get(i[0].dataset.id);if(!e.get("todo"))return s.msg.show({type:"warning",time:2500,text:this.t("msg:printNext:todo")});var o=t.find(e.get("jobs"),function(t){return"pending"===t.status});if(!o)return s.msg.show({type:"warning",time:2500,text:this.t("msg:printNext:pending")});this.printSpecific(e,o)}},printSpecific:function(t,i){t.trigger("printing",!0);var n=this,o=n.ajax({method:"POST",url:"/kanban/printQueues;print",data:JSON.stringify({queue:t.id,job:i._id})});o.fail(function(){var t=o.responseJSON&&o.responseJSON.error&&o.responseJSON.error.code||"failure";e.has("kanbanPrintQueues","msg:print:"+t)||(t="failure"),s.msg.show({type:"error",time:2500,text:n.t("msg:print:"+t)})}),o.always(function(){t.trigger("printing",!1)})},onAdd:function(t){this.insertView("#-items",new a({model:t}))},onWindowKeyDown:function(t){if(document.activeElement===document.body)return"ArrowDown"===t.key?(this.toggleNext(),!1):"ArrowUp"===t.key?(this.togglePrev(),!1):void(" "===t.key&&t.preventDefault())},onWindowKeyUp:function(t){if(document.activeElement===document.body)return" "===t.key?(t.timeStamp-this.lastSpaceAt<500&&this.printNext(),this.lastSpaceAt=t.timeStamp,!1):void 0},toggleNext:function(){var t,i=this.$(".is-expanded");0===i.length?t=this.$el:(t=i.next(),t.length||(t=this.$el)),t.find(".kanbanPrintQueues-item-hd").first().click()},togglePrev:function(){var t,i=this.$(".is-expanded");0===i.length?t=this.$(".kanbanPrintQueues-item").last():(t=i.prev(),t.length||(t=this.$(".kanbanPrintQueues-item").last())),t.find(".kanbanPrintQueues-item-hd").first().click()}})});