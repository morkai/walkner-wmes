define(["jquery","app/time","app/i18n","app/viewport","app/core/View","./QuantityEditorView","app/production/templates/quantities"],function(e,t,n,r,i,o,a){return i.extend({template:a,events:{"click .production-quantities-actual .btn-link":"showQuantityEditor"},initialize:function(){this.listenTo(this.model,"change:quantitiesDone change:shift locked unlocked",this.render)},serialize:function(){var e=t.getServerMoment().valueOf(),n=this.model.getCurrentShiftMoment(),r=!this.model.isLocked();return{quantityRows:(this.model.get("quantitiesDone")||[]).map(function(t,i){var o=r,a=n.format("HH:mm:ss");return n.add("minutes",59).add("seconds",59),o=7===i?o&&e>n.valueOf()-6e5:o&&e>n.valueOf(),a+="-"+n.format("HH:mm:ss"),n.add("seconds",1),{time:a,planned:t.planned,actual:t.actual,editable:o||t.actual>0}})}},afterRender:function(){this.timers.nextRender&&clearTimeout(this.timers.nextRender),this.model.isLocked()||this.scheduleNextRender()},scheduleNextRender:function(){var e=this.model.getCurrentShiftMoment().add("hours",7).hours(),n=t.getServerMoment(),r=n.valueOf(),i=n.hours(),o=n.minutes(0).seconds(0).milliseconds(0).add("hours",1).valueOf(),a=i===e?o-6e5:o,s=a+1e3-r;s>0?this.timers.nextRender=setTimeout(function(e){e.render(),e.showEditorDialog()},s,this):delete this.timers.nextRender},showQuantityEditor:function(t){function r(){u.remove(),s.show(),l.show()}function i(){var e=parseInt(u.val(),10);r();var t=o.attr("data-hour");e!==d&&e>=0&&(l.text(e),a.model.changeQuantitiesDone(parseInt(t,0),e)),a.$("td[data-hour="+t+"] .btn-link").focus()}var o=this.$(t.target).closest("td");if(!o.find("input").length)var a=this,s=o.find(".btn-link").hide(),l=o.find("span").hide(),d=parseInt(l.text(),10),u=e('<input class="form-control" type="number" min="0">').attr("placeholder",n("production","quantities:newValuePlaceholder")).val(d).on("blur",i).on("keydown",function(e){27===e.which?setTimeout(r,1):13===e.which&&setTimeout(i,1)}).appendTo(o).select()},showEditorDialog:function(e){e||(e=this.$(".btn-link").last().closest("td"));var t=e.parent().find("td:first-child").text().trim().split("-"),i=parseInt(e.attr("data-hour"),10),a={from:t[0],to:t[1],currentQuantity:parseInt(e.find("span").text(),10)},s=new o(a);this.listenTo(s,"quantityChanged",function(e){r.closeDialog(),null!==e&&this.model.changeQuantitiesDone(i,e)}),r.showDialog(s,n("production","quantityEditor:title"))}})});