// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/time","app/i18n","app/viewport","app/core/View","./QuantityEditorView","app/production/templates/quantities"],function(t,e,n,i,o,a,s,r){"use strict";return a.extend({template:r,events:{"click .production-quantities-actual .btn-link":"showQuantityEditor","mousedown .production-quantities-actual .btn-link":"showQuantityEditor"},initialize:function(){this.onQuantitiesDoneChanged=this.onQuantitiesDoneChanged.bind(this),this.listenTo(this.model,"change:shift locked unlocked",this.render)},serialize:function(){var t=n.getMoment().valueOf(),e=this.model.getCurrentShiftMoment(),i=!this.model.isLocked();return{quantityRows:(this.model.get("quantitiesDone")||[]).map(function(n,o){var a=i,s=e.format("HH:mm:ss");return e.add(59,"minutes").add(59,"seconds"),a=7===o?a&&t>e.valueOf()-6e5:a&&t>e.valueOf(),s+="-"+e.format("HH:mm:ss"),e.add(1,"seconds"),{time:s,planned:n.planned,actual:n.actual,editable:a||n.actual>0}})}},beforeRender:function(){this.stopListening(this.model,"change:quantitiesDone",this.onQuantitiesDoneChanged)},afterRender:function(){this.listenTo(this.model,"change:quantitiesDone",this.onQuantitiesDoneChanged),this.timers.nextRender&&clearTimeout(this.timers.nextRender),this.model.isLocked()||this.scheduleNextRender()},scheduleNextRender:function(){var t=this.model.getCurrentShiftMoment().add(7,"hours").hours(),e=n.getMoment(),i=e.valueOf(),o=e.hours(),a=e.minutes(0).seconds(0).milliseconds(0).add(1,"hours").valueOf(),s=o===t?a-6e5:a,r=s+1e3-i;r>0?this.timers.nextRender=setTimeout(function(t){t.render(),t.showEditorDialog()},r,this):delete this.timers.nextRender},showQuantityEditor:function(n){function o(){c.remove(),u.show(),l.show()}function a(){var t=parseInt(m.val(),10);o();var e=s.attr("data-hour");t!==h&&t>=0&&d>=t&&(l.text(t),r.model.changeQuantitiesDone(parseInt(e,0),t,{render:!1}))}var s=this.$(n.target).closest("td");if(!s.find("input").length){var r=this,d=this.model.getMaxQuantitiesDone(),u=s.find(".btn-link").hide(),l=s.find("span").hide(),h=parseInt(l.text(),10),c=e("<form></form>").submit(function(){return a(),!1}),m=e('<input class="form-control" type="number" min="0">').attr("placeholder",i("production","quantities:newValuePlaceholder")).attr("max",d).val(h).on("keydown",function(e){27===e.which&&t.defer(o)}).appendTo(c);c.appendTo(s),t.defer(function(){m.select().on("blur",function(){t.defer(a)})})}},showEditorDialog:function(t){t||(t=this.$(".btn-link").last().closest("td"));var e=t.parent().find("td:first-child").text().trim().split("-"),n=parseInt(t.attr("data-hour"),10),a={from:e[0],to:e[1],currentQuantity:parseInt(t.find("span").text(),10),maxQuantity:this.model.getMaxQuantitiesDone()},r=new s(a);this.listenTo(r,"quantityChanged",function(t){o.closeDialog(),null!==t&&this.model.changeQuantitiesDone(n,t,{render:!0})}),o.showDialog(r,i("production","quantityEditor:title"))},onQuantitiesDoneChanged:function(t,e,n){n.render!==!1&&this.render()}})});