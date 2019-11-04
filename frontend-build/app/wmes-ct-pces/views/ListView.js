define(["underscore","app/time","app/core/views/ListView","app/wmes-ct-pces/templates/durationPopover","app/wmes-ct-pces/templates/orderPopover"],function(t,e,i,r,a){"use strict";return i.extend({className:"",remoteTopics:{"ct.pces.saved":"refreshCollection"},serializeColumns:function(){return[{id:"startedAt",className:"is-min"},{id:"duration",className:"is-min text-right"},{id:"order",className:"is-min"},{id:"pce",className:"is-min is-number",label:this.t("PROPERTY:pce:short")},{id:"line",className:"is-min"},{id:"station",className:"is-min is-number",label:this.t("PROPERTY:station:short")},"-"]},serializeActions:function(){return null},afterRender:function(){var s=this;i.prototype.afterRender.apply(s,arguments),s.$el.popover({container:s.el,selector:"td[data-id]",trigger:"hover",placement:"right",html:!0,css:{maxWidth:"350px"},hasContent:function(){return"duration"===this.dataset.id||"order"===this.dataset.id},content:function(){var i=s.collection.get(this.parentNode.dataset.id);if("duration"===this.dataset.id){var n=i.get("durations");return s.renderPartialHtml(r,{durations:{total:e.toString(n.total/1e3,!1,!0),work:e.toString(n.work/1e3,!1,!0),downtime:e.toString(n.downtime/1e3,!1,!0),scheduled:e.toString(n.scheduled/1e3,!1,!0)}})}if("order"===this.dataset.id){var o=i.get("order");return s.renderPartialHtml(a,{order:{_id:o._id,nc12:o.nc12,name:t.escape(o.name),qty:o.qty,workerCount:o.workerCount,sapTaktTime:e.toString(o.sapTaktTime,!1,!1)}})}}})}})});