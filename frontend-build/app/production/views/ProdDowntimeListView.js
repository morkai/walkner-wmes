// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/time","app/viewport","app/data/aors","app/data/downtimeReasons","app/core/views/ListView","./DowntimePickerView"],function(e,t,o,i,n,r,s){"use strict";return r.extend({className:"production-downtimes",localTopics:{"downtimeReasons.synced":"render","aors.synced":"render"},remoteTopics:function(){var e={};return this.model.prodLine&&(e["prodDowntimes.corroborated."+this.model.prodLine.id+".*"]="onCorroborated"),e},events:{"click .warning":"showEditDialog"},initialize:function(){this.collection=this.model.prodDowntimes,r.prototype.initialize.apply(this,arguments),this.listenTo(this.collection,"add",this.render),this.listenTo(this.collection,"change",this.render),this.listenTo(this.collection,"remove",this.render)},destroy:function(){this.$el.popover("destroy")},serializeColumns:function(){return[{id:"startedAt",label:e("production","prodDowntime:startedAt")},{id:"finishedAt",label:e("production","prodDowntime:finishedAt")},{id:"reason",label:e("production","prodDowntime:reason")},{id:"aor",label:e("production","prodDowntime:aor")}]},serializeRows:function(){return this.model.prodDowntimes.map(function(e){var o=e.toJSON(),r=i.get(o.aor),s=n.get(o.reason);return o.className=e.getCssClassName(),o.startedAt=t.format(o.startedAt,"YYYY-MM-DD HH:mm:ss"),o.finishedAt=o.finishedAt?t.format(o.finishedAt,"YYYY-MM-DD HH:mm:ss"):"-",r&&(o.aor=r.get("name")),s&&(o.reason=s.get("label")),o.reasonComment&&(o.className+=" has-comment",o.reason+=' <i class="fa fa-info-circle"></i>'),o})},serializeActions:function(){return[]},afterRender:function(){r.prototype.afterRender.call(this);var e=this;this.$el.popover({selector:".has-comment",trigger:"hover",placement:"top",container:this.el.ownerDocument.body,content:function(){return e.model.prodDowntimes.get(this.dataset.id).get("reasonComment")}}).on("shown.bs.popover",function(t){e.$(t.target).data("bs.popover").$tip.addClass("production-downtimes-popover")})},onCorroborated:function(e){var t=this.model.prodDowntimes.get(e._id);t&&(delete e.changes,t.set(e),this.trigger("corroborated",e._id))},showEditDialog:function(t){var i=this.model,n=i.prodDowntimes.get(t.currentTarget.dataset.id),r=new s({model:{mode:"edit",prodShift:i,startedAt:new Date(n.get("startedAt")),reason:n.get("reason"),aor:n.get("aor"),reasonComment:n.get("reasonComment")}});this.listenTo(r,"downtimePicked",function(e){delete e.startedAt,i.editDowntime(n,e),o.closeDialog()}),o.showDialog(r,e("production","downtimePicker:title:edit"))}})});