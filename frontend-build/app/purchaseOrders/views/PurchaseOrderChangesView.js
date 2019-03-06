define(["underscore","jquery","app/i18n","app/time","app/core/View","app/core/templates/userInfo","app/purchaseOrders/templates/changes","app/purchaseOrders/templates/newItemsChange","app/purchaseOrders/templates/itemScheduleChange","app/purchaseOrders/templates/printsChange"],function(e,t,n,s,i,r,a,h,l,c){"use strict";return i.extend({template:a,events:{"mouseover .pos-changes-change-next":function(e){this.highlightDateAndUserCell(e.currentTarget)},"mouseout .pos-changes-change-next":function(e){this.highlightDateAndUserCell(e.currentTarget)},"mouseover .pos-changes-prints-item":function(e){this.highlightPrintCells(e.currentTarget)},"mouseout .pos-changes-prints-item":function(e){this.highlightPrintCells(e.currentTarget)},"click #-more":"showAllChanges"},initialize:function(){this.hidden=!0},getTemplateData:function(){return{changes:this.serializeChanges(),hidden:this.hidden}},serializeChanges:function(){var e=[],t=this.model.get("changes"),i=t.length-1;return t.forEach(function(t,a){var l=[],c=[];Object.keys(t.data).forEach(function(e){var n=t.data[e],s=this.serializeChange(e,n[0],n[1]);"item"===s.key?c.push(s.newValue):"importedAt"===s.key?l.unshift(s):l.push(s)},this),c.length&&l.push({key:"newItems",name:n("purchaseOrders","changes:newItems"),oldValue:"-",newValue:this.renderPartial(h,{items:c})}),e.push({visible:!this.hidden||i<3||0===a||a===i,date:s.format(t.date,"LLLL"),user:r({userInfo:t.user}),properties:l})},this),e},serializeChange:function(e,t,s){var i=e.split("/"),r=e,a=e;return 1===i.length?a=n("purchaseOrders","PROPERTY:"+e):"items"===i[0]&&(a=n("purchaseOrders","PROPERTY:item",{itemNo:i[1]}),r="item",3===i.length?(r+="."+i[2],a=n("purchaseOrders","changes:itemProp",{item:a,prop:n("purchaseOrders","PROPERTY:"+r)})):"cancelled"===i[4]&&(r+=".prints."+i[4],a=n("purchaseOrders","changes:itemProp",{item:a,prop:n("purchaseOrders","changes:printCancelled",{printIndex:parseInt(i[3],10)+1})}))),{key:r,name:a,oldValue:this.serializeChangeValue(r,t),newValue:this.serializeChangeValue(r,s)}},serializeChangeValue:function(t,i){if(null===i)return"-";var r=typeof i;if("boolean"===r)return n("core","BOOL:"+i);if("number"===r)return i.toLocaleString();var a=Date.parse(i);return isNaN(a)?"string"===r?e.escape(i):"item"===t?this.serializeItemChangeValue(i):"item.schedule"===t?this.renderPartial(l,{schedule:i}):"prints"===t?this.renderPartial(c,{change:i}):e.escape(JSON.stringify(i)):s.format(a,"LLLL")},serializeItemChangeValue:function(e){return{_id:e._id,nc12:e.nc12,unit:e.unit,qty:e.qty.toLocaleString(),name:e.name,schedule:l({schedule:e.schedule})}},beforeRender:function(){this.stopListening(this.model,"change:changes",this.render)},afterRender:function(){this.listenToOnce(this.model,"change:changes",this.render),this.$(".pos-changes-change").last().addClass("is-last")},highlightDateAndUserCell:function(e){this.$(e).prevAll(".pos-changes-change").first().find("[rowspan]").toggleClass("is-hovered")},highlightPrintCells:function(e){this.$(e).parent().children().first().find("[rowspan]").toggleClass("is-hovered")},showAllChanges:function(){this.$id("more").remove(),this.$(".hidden").removeClass("hidden"),this.hidden=!1}})});