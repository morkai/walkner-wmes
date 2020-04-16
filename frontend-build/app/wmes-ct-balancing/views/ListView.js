define(["underscore","jquery","app/time","app/user","app/viewport","app/core/views/ListView","app/wmes-ct-balancing/templates/orderPopover","app/wmes-ct-balancing/templates/commentEditor"],function(t,e,i,o,n,r,s,d){"use strict";return r.extend({className:function(){return"ct-balancing-list "+(o.isAllowedTo("PROD_DATA:MANAGE")?"is-editable":"")},remoteTopics:{"ct.balancing.pces.updated":function(t){var e=this;t.deleted&&t.deleted.forEach(t=>{var i=e.collection.get(t._id);i&&e.collection.remove(i)}),t.updated&&t.updated.forEach(t=>{var i=e.collection.get(t._id);i&&i.set(t)}),t.added&&(this.commenting?this.needsRefresh=!0:this.refreshCollectionIfNeeded(t.added))}},events:Object.assign({'click td[data-id="comment"]':function(t){o.isAllowedTo("PROD_DATA:MANAGE","FN:*process-engineer*")&&this.showCommentEditor(this.$(t.currentTarget).closest(".list-item")[0].dataset.id)}},r.prototype.events),serializeColumns:function(){return[{id:"order",className:"is-min"},{id:"line",className:"is-min"},{id:"station",className:"is-min is-number",label:this.t("PROPERTY:station:short")},{id:"startedAt",className:"is-min"},{id:"d",className:"is-min text-right"},{id:"stt",className:"is-min text-right"},{id:"comment"}]},serializeActions:function(){var t=this,e=o.isAllowedTo("PROD_DATA:MANAGE","FN:*process-engineer*");return function(i){var o=[];return e&&o.push(r.actions.delete(t.collection.get(i._id))),o}},initialize:function(){r.prototype.initialize.apply(this,arguments),this.commenting=!1,this.needsRefresh=!1,this.listenTo(this.collection,"sync",function(){this.needsRefresh=!1,this.hideEditor(!1)}),this.once("afterRender",function(){this.listenTo(this.collection,"change:comment",this.onCommentChange),this.listenTo(this.collection,"remove",this.onPceRemove)}),e(window).on("keydown."+this.idPrefix,this.onWindowKeyDown.bind(this)).on("resize."+this.idPrefix,this.onWindowResize.bind(this))},destroy:function(){r.prototype.destroy.apply(this,arguments),e(window).off("."+this.idPrefix)},afterRender:function(){var e=this;r.prototype.afterRender.apply(e,arguments),e.$el.popover({container:e.el,selector:"td[data-id]",trigger:"hover",placement:"right",html:!0,css:{maxWidth:"350px"},hasContent:function(){return"order"===this.dataset.id},content:function(){var o=e.collection.get(this.parentNode.dataset.id);if("order"===this.dataset.id){var n=o.get("order");return e.renderPartialHtml(s,{order:{_id:n._id,nc12:n.nc12,name:t.escape(n.name),mrp:n.mrp,qty:n.qty,workerCount:n.workerCount,sapTaktTime:i.toString(n.sapTaktTime,!1,!1)}})}}})},refreshCollectionIfNeeded:function(t){var e=this.collection.getProductFilter();(t=t.filter(function(t){return t.order._id===e||t.order.nc12===e})).length&&(this.trigger("reloadNeeded"),this.collection.length+t.length<=this.collection.rqlQuery.limit?(this.collection.add(t,{at:0}),this.render()):this.refreshCollection())},onCommentChange:function(t){this.$cell(t.id,"comment").text(t.get("comment"))},onPceRemove:function(t){this.$editor&&this.$editor.data("id")===t.id&&this.hideEditor(!0),this.$row(t.id).remove(),this.trigger("reloadNeeded")},showCommentEditor:function(t){var e=this,i=e.collection.get(t);i?(e.$editor&&(e.$editor.data("id")!==t||e.$editor.data("prop","comment"))&&this.hideEditor(),e.$editor=e.renderPartial(d,{comment:i.get("comment")}),e.$editor.data("id",t).data("prop","comment"),e.$editor.find(".form-control").on("keyup",function(t){t.ctrlKey&&"Enter"===t.key&&e.$editor.find(".btn-primary").click()}),e.$editor.on("submit",function(){var t=e.$editor.find(".form-control").val();if(t.replace(/[^A-Z0-9]+/gi,"")===i.get("comment").replace(/[^A-Z0-9]+/gi,""))return e.hideEditor(!0),!1;n.msg.saving();var o=i.save({comment:t},{wait:!0});return o.fail(function(){n.msg.savingFailed()}),o.done(function(){n.msg.saved(),e.hideEditor(!0)}),!1}),e.positionEditor(),e.$editor.appendTo("body").find(".form-control").focus()):e.hideEditor(!1)},positionEditor:function(){if(this.$editor){var t=this.$cell(this.$editor.data("id"),this.$editor.data("prop")),e=t.position();this.$editor.css({top:e.top+5+"px",left:e.left+5+"px",width:t.outerWidth()-10+"px"})}},hideEditor:function(t){this.$editor&&(this.$editor.remove(),this.$editor=null),!1!==t&&this.needsRefresh&&this.refreshCollectionNow()},onWindowKeyDown:function(t){"Escape"===t.key&&this.hideEditor(!0)},onWindowResize:function(){this.positionEditor()}})});