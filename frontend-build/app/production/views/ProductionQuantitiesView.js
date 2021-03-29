define(["underscore","jquery","app/time","app/i18n","app/viewport","app/core/View","./QuantityEditorView","app/production/templates/quantities"],function(t,e,n,i,o,s,a,d){"use strict";return s.extend({template:d,events:{"click .production-quantities-actual":"showQuantityEditor","mousedown .production-quantities-actual":"showQuantityEditor"},initialize:function(){this.onQuantitiesDoneChanged=this.onQuantitiesDoneChanged.bind(this),this.listenTo(this.model,"change:shift locked unlocked",this.render),this.listenTo(this.model.settings,"reset change",function(t){t&&!/taktTime/.test(t.id)||this.render()})},getTemplateData:function(){var t=n.getMoment().valueOf(),e=this.model.getCurrentShiftMoment(),i=!this.model.isLocked(),o=this.model.isTaktTimeEnabled();return{quantityRows:(this.model.get("quantitiesDone")||[]).map(function(n,s){var a=i,d=e.format("HH:00");return e.add(59,"minutes").add(59,"seconds"),a=7===s?a&&t>e.valueOf()-6e5:a&&t>e.valueOf(),{time:d+="-"+e.add(1,"seconds").format("HH:00"),planned:n.planned,actual:n.actual,editable:(a||n.actual>0)&&!o}})}},beforeRender:function(){this.stopListening(this.model,"change:quantitiesDone",this.onQuantitiesDoneChanged)},afterRender:function(){this.listenTo(this.model,"change:quantitiesDone",this.onQuantitiesDoneChanged),this.timers.nextRender&&clearTimeout(this.timers.nextRender),this.model.isLocked()||this.scheduleNextRender(),window.qv=this},scheduleNextRender:function(){var t=this.model.getCurrentShiftMoment().add(7,"hours").hours(),e=n.getMoment(),i=e.valueOf(),o=e.hours(),s=e.minutes(0).seconds(0).milliseconds(0).add(1,"hours").valueOf(),a=(o===t?s-6e5:s)+1e3-i;a>0?this.timers.nextRender=setTimeout(function(t){t.render(),t.showEditorDialog()},a,this):delete this.timers.nextRender},showQuantityEditor:function(n){var o=this.$(n.target).closest("td");if(!(o.find("input").length||this.model.isLocked()||this.model.isTaktTimeEnabled()))if(this.options.embedded)this.showEditorDialog(o);else if(o.find(".btn-link").length){var s=this,a=this.model.getMaxQuantitiesDone(),d=o.find(".btn-link").hide(),r=o.find("span").hide(),u=parseInt(r.text(),10),l=e("<form></form>").submit(function(){return m(),!1}),h=e('<input class="form-control production-quantities-editor" type="number" min="0">').attr({placeholder:i("production","quantities:newValuePlaceholder"),max:a,value:u}).on("keydown",function(e){27===e.which&&t.defer(c)}).appendTo(l);l.appendTo(o),t.defer(function(){h.select().on("blur",function(){t.defer(m)})})}function c(){l.remove(),d.show(),r.show()}function m(){var t=parseInt(h.val(),10);c();var e=o.attr("data-hour");t!==u&&t>=0&&t<=a&&(r.text(t+" "+i("production","quantities:unit")),s.model.changeQuantitiesDone(parseInt(e,10),t,{render:!1}))}},showEditorDialog:function(t){if(!(this.model.isTaktTimeEnabled()||o.currentDialog&&o.currentDialog instanceof a)){var n=this.$(".btn-link");if(t&&t.length&&t.find(".btn-link").length||(t=n.last().closest("td")),t.length){var s={hours:[],maxQuantity:this.model.getMaxQuantitiesDone(),selected:parseInt(t.attr("data-hour"),10)};this.$(".production-quantities-actual").each(function(){var t=e(this),n=t.parent().find("td:first-child").text().trim().split("-"),i=parseInt(t.attr("data-hour"),10);s.hours.push({from:n[0],to:n[1],index:i,value:parseInt(t.find("span").text(),10),disabled:0===t.find(".btn-link").length})});var d=new a({model:s,embedded:this.options.embedded,vkb:this.options.vkb});this.listenTo(d,"quantityChanged",function(t,e){o.closeDialog(),null!==e&&this.model.changeQuantitiesDone(t,e,{render:!0})}),o.closeDialogs(function(t){return!(t instanceof a)}),o.showDialog(d,i("production","quantityEditor:title"))}}},onQuantitiesDoneChanged:function(t,e,n){!1!==n.render&&this.render()}})});