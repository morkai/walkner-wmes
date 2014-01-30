define(["underscore","app/i18n","app/user","app/viewport","app/core/views/ListView","./CorroborateProdDowntimeView","./decorateProdDowntime","i18n!app/nls/prodDowntimes"],function(e,t,n,r,i,o,a){return i.extend({remoteTopics:{"prodDowntimes.created.*":function(e){this.collection.hasOrMatches(e)&&this.refreshCollection()},"prodDowntimes.finished.*":function(e){var t=this.collection.get(e._id);t&&t.set("finishedAt",new Date(e.finishedAt))},"prodDowntimes.corroborated.*":function(e){e._id===this.corroboratingId&&r.closeDialog(),this.collection.hasOrMatches(e)&&this.refreshCollection()}},events:{"click .action-corroborate":function(e){e.preventDefault();var n=this;this.broker.subscribe("viewport.dialog.hidden",function(){n.corroboratingId=null}),this.corroboratingId=this.$(e.target).closest("tr").attr("data-id"),r.showDialog(new o({model:this.collection.get(this.corroboratingId)}),t("prodDowntimes","corroborate:title"))}},columns:["aor","prodLine","reason","startedAt","finishedAt","duration"],initialize:function(){i.prototype.initialize.apply(this,arguments),this.corroboratingId=null,this.listenTo(this.collection,"change",this.render)},serializeRows:function(){return this.collection.map(a)},serializeActions:function(){var e=this.collection;return function(r){var o=e.get(r._id),a=[i.actions.viewDetails(o)];return"undecided"===r.status&&n.isAllowedTo("PROD_DOWNTIMES:MANAGE")&&a.push({id:"corroborate",icon:"gavel",label:t("prodDowntimes","LIST:ACTION:corroborate"),href:o.genClientUrl("corroborate")}),a}},afterRender:function(){i.prototype.afterRender.call(this);var e=this;this.$('.is-withReasonComment > td[data-id="reason"]').popover({container:this.el,trigger:"hover",placement:"auto right",content:function(){var t=e.$(this).closest("tr").attr("data-id");return e.collection.get(t).get("reasonComment")}}).append('<i class="fa fa-info-circle"></i>').on("shown.bs.popover",function(){e.$(this).data("bs.popover").$tip.addClass("prodDowntimes-comment")})}})});