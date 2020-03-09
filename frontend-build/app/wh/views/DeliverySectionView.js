define(["app/time","app/core/View","app/wh/templates/delivery/section","app/wh/templates/delivery/item","app/wh/templates/resolveAction"],function(t,e,s,i,n){"use strict";return e.extend({template:s,nlsDomain:"wh",events:{"submit .wh-pa-resolveAction":function(){var t=this.$(".wh-pa-resolveAction").find(".form-control").val();return this.model.trigger("resolveAction",t),!1}},initialize:function(){this.listenTo(this.setCarts,"reset",this.onReset),this.listenTo(this.setCarts,"remove",this.onRemoved),this.listenTo(this.setCarts,"add",this.onAdded),this.listenTo(this.setCarts,"change",this.onChanged),this.options.resolveAction&&this.listenTo(this.model,"change:personnelId",this.onPersonnelIdChanged)},getTemplateData:function(){return{kind:this.options.kind,status:this.options.status,renderItem:this.renderPartialHtml.bind(this,i),items:this.serializeItems(),resolveAction:this.options.resolveAction?this.renderPartialHtml(n,{pattern:"development"===window.ENV?"":"^[0-9]{5,}$"}):""}},afterRender:function(){console.log("DeliverySectionView.afterRender",this.options.status),this.options.resolveAction&&this.onPersonnelIdChanged()},serializeItems:function(){var t=this,e=[];return t.setCarts.forEach(function(s){e.push(t.serializeItem(s))}),e},serializeItem:function(e){var s=e.toJSON();return s.model=e,s.className=this.getStatusClassName(e),s.lineClassName=s.line.length>=15?"wh-is-very-long":s.line.length>10?"wh-is-long":"",s.date=t.utc.format(s.date,"L"),s.set=this.t("delivery:set",{set:s.set}),s.sapOrders={},s.orders.forEach(function(t){s.sapOrders[t.sapOrder]=1}),s.sapOrders=Object.keys(s.sapOrders),s},getStatusClassName:function(t){if("delivering"===t.get("status"))return"wh-status-delivering";for(var e=this.whSettings.getLateDeliveryTime(),s=this.whSettings.getMinTimeForDelivery(),i=t.get("lines"),n="pending"===this.options.status?"wh-status-pending":"",o=0;o<i.length;++o){var r=this.lines.get(i[o]);if(r){var a=r.get("components").time;if(a<e){n="wh-status-late";break}a<s&&(n="wh-status-deliverable")}}return n},highlight:function(){var t=this;t.setCarts.forEach(function(e){var s=t.getStatusClassName(e),i=t.$item(e.id);i.hasClass(s)||i.removeClass("wh-status-pending wh-status-deliverable wh-status-late wh-status-delivering").addClass(s)})},$item:function(t){return this.$('.wh-delivery-item[data-id="'+t+'"]')},renderItem:function(t){return this.renderPartialHtml(i,{item:this.serializeItem(t)})},onReset:function(){var t=this,e=t.$id("items"),s="";t.setCarts.forEach(function(e){s+=t.renderItem(e)}),s+=e.find("tfoot")[0].outerHTML,e.html(s)},onRemoved:function(t){console.log("onRemoved",this.options.status,t),this.$item(t.id).remove()},onAdded:function(t){console.log("onAdded",this.options.status,t),this.$id("items").append(this.renderItem(t))},onChanged:function(t){console.log("onChanged",this.options.status,t),this.$item(t.id).replaceWith(this.renderItem(t))},onPersonnelIdChanged:function(){this.$(".wh-pa-resolveAction").find(".form-control").val(this.model.get("personnelId")||"")}})});