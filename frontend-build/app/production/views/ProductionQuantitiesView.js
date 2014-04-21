// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/time","app/i18n","app/viewport","app/core/View","./QuantityEditorView","app/production/templates/quantities"],function(t,e,n,i,o,a,s){return o.extend({template:s,events:{"click .production-quantities-actual .btn-link":"showQuantityEditor"},initialize:function(){this.listenTo(this.model,"change:quantitiesDone change:shift locked unlocked",this.render)},serialize:function(){var t=e.getMoment().valueOf(),n=this.model.getCurrentShiftMoment(),i=!this.model.isLocked();return{quantityRows:(this.model.get("quantitiesDone")||[]).map(function(e,o){var a=i,s=n.format("HH:mm:ss");return n.add("minutes",59).add("seconds",59),a=7===o?a&&t>n.valueOf()-6e5:a&&t>n.valueOf(),s+="-"+n.format("HH:mm:ss"),n.add("seconds",1),{time:s,planned:e.planned,actual:e.actual,editable:a||e.actual>0}})}},afterRender:function(){this.timers.nextRender&&clearTimeout(this.timers.nextRender),this.model.isLocked()||this.scheduleNextRender()},scheduleNextRender:function(){var t=this.model.getCurrentShiftMoment().add("hours",7).hours(),n=e.getMoment(),i=n.valueOf(),o=n.hours(),a=n.minutes(0).seconds(0).milliseconds(0).add("hours",1).valueOf(),s=o===t?a-6e5:a,r=s+1e3-i;r>0?this.timers.nextRender=setTimeout(function(t){t.render(),t.showEditorDialog()},r,this):delete this.timers.nextRender},showQuantityEditor:function(e){function i(){h.remove(),d.show(),u.show()}function o(){var t=parseInt(c.val(),10);i();var e=a.attr("data-hour");return t!==l&&t>=0&&(u.text(t),s.model.changeQuantitiesDone(parseInt(e,0),t)),s.$("td[data-hour="+e+"] .btn-link").focus(),!1}var a=this.$(e.target).closest("td");if(!a.find("input").length){var s=this,r=this.model.getMaxQuantitiesDone(),d=a.find(".btn-link").hide(),u=a.find("span").hide(),l=parseInt(u.text(),10),h=t("<form></form>").submit(o),c=t('<input class="form-control" type="number" min="0">').attr("placeholder",n("production","quantities:newValuePlaceholder")).attr("max",r).val(l).on("blur",o).on("keydown",function(t){27===t.which&&setTimeout(i,1)}).appendTo(h);h.appendTo(a),c.select()}},showEditorDialog:function(t){t||(t=this.$(".btn-link").last().closest("td"));var e=t.parent().find("td:first-child").text().trim().split("-"),o=parseInt(t.attr("data-hour"),10),s={from:e[0],to:e[1],currentQuantity:parseInt(t.find("span").text(),10),maxQuantity:this.model.getMaxQuantitiesDone()},r=new a(s);this.listenTo(r,"quantityChanged",function(t){i.closeDialog(),null!==t&&this.model.changeQuantitiesDone(o,t)}),i.showDialog(r,n("production","quantityEditor:title"))}})});