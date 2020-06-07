define(["underscore","app/time","app/core/View","app/wh/templates/delivery/section","app/wh/templates/delivery/item","app/wh/templates/resolveAction"],function(t,e,i,s,n,r){"use strict";return i.extend({template:s,nlsDomain:"wh",events:{"click #-forceLine":function(){this.trigger("forceLineClicked")},"click .wh-delivery-item":function(t){if("delivering"===this.options.status){var e=this.setCarts.get(t.currentTarget.dataset.id).get("deliveringBy");this.model.trigger("continueDelivery",{user:e,setCarts:this.setCarts.filter(function(t){return t.get("deliveringBy").id===e.id}).map(function(t){return t.id})})}},"submit .wh-pa-resolveAction":function(){document.activeElement&&document.activeElement.blur();var t=this.$(".wh-pa-resolveAction").find(".form-control").val();return this.model.trigger("resolveAction",t),!1}},initialize:function(){this.listenTo(this.setCarts,"reset",this.onReset),this.listenTo(this.setCarts,"remove",this.onRemoved),this.listenTo(this.setCarts,"add",this.onAdded),this.listenTo(this.setCarts,"change",this.onChanged),this.options.actions&&this.listenTo(this.model,"change:personnelId",this.onPersonnelIdChanged)},getTemplateData:function(){return{kind:this.options.kind,status:this.options.status,renderItem:this.renderPartialHtml.bind(this,n),items:this.serializeItems(),actions:!!this.options.actions,resolveAction:this.options.actions?this.renderPartialHtml(r,{pattern:"production"!==window.ENV?"":"^[0-9]{5,}$",value:this.model.get("personnelId")}):""}},afterRender:function(){this.options.resolveAction&&this.onPersonnelIdChanged()},serializeItems:function(){var t=this,e=[];return t.setCarts.forEach(function(i){e.push(t.serializeItem(i))}),e},serializeItem:function(t){var i=t.toJSON();return i.model=t,i.className=this.getStatusClassName(t),i.line=this.serializeItemLine(t),i.date=e.utc.format(i.date,"L"),i.startTime=e.utc.format(i.startTime,"HH:mm:ss"),i.set=this.t("delivery:set",{set:i.set}),i.sapOrders={},i.orders.forEach(function(t){i.sapOrders[t.sapOrder]=1}),i.sapOrders=Object.keys(i.sapOrders),i},serializeItemLine:function(e){var i=e.get("line"),s=e.get("lines"),n=e.get("redirLine"),r=e.get("redirLines"),a=i.length,o=23,l=19;"completed"===this.options.status&&(o=16,l=12);var h="",d="",c=t.escape(i);return n&&(a+=2,c='<i class="fa fa-arrow-right"></i>'+c,"completed"!==this.options.status&&(a+=n.length,c=t.escape(n)+c),1===s.length?h=n+" ➜ "+i:(h=i+":",s.forEach(function(t,e){t===r[e]?h+="\n - "+t:h+="\n - "+r[e]+" ➜ "+t}))),a>o?d="wh-is-very-long":a>l&&(d="wh-is-long"),{title:h,className:d,label:c}},getStatusClassName:function(t){if("delivering"===t.get("status"))return"wh-status-delivering";for(var e=this.whSettings.getLateDeliveryTime(),i=this.whSettings.getMinTimeForDelivery(),s=t.get("lines"),n="pending"===this.options.status?"wh-status-pending":"",r=0;r<s.length;++r){var a=this.lines.get(s[r]);if(a){var o=a.get("available").time;if(o<e){n="wh-status-late";break}o<i&&(n="wh-status-deliverable")}}return n},highlight:function(){var t=this;t.setCarts.forEach(function(e){var i=t.getStatusClassName(e),s=t.$item(e.id);s.hasClass(i)||s.removeClass("wh-status-pending wh-status-deliverable wh-status-late wh-status-delivering").addClass(i)})},$item:function(t){return this.$('.wh-delivery-item[data-id="'+t+'"]')},renderItem:function(t){return this.renderPartialHtml(n,{item:this.serializeItem(t)})},onReset:function(){var t=this,e=t.$id("items"),i="";t.setCarts.forEach(function(e){i+=t.renderItem(e)}),i+=e.find("tfoot")[0].outerHTML,e.html(i)},onRemoved:function(t){this.$item(t.id).remove()},onAdded:function(t){this.$id("items").append(this.renderItem(t))},onChanged:function(t){this.$item(t.id).replaceWith(this.renderItem(t))},onPersonnelIdChanged:function(){this.$(".wh-pa-resolveAction").find(".form-control").val(this.model.get("personnelId")||"")}})});