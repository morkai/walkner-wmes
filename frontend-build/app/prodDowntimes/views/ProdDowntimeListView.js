// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/user","app/time","app/core/views/ListView","../util/decorateProdDowntime"],function(e,t,i,s,n,a){"use strict";return n.extend({className:"is-colored is-clickable prodDowntimes-list",remoteTopics:{"prodDowntimes.created.*":"refreshIfMatches","prodDowntimes.updated.*":"refreshIfMatches","prodDowntimes.deleted.*":"refreshIfMatches"},columns:[{id:"rid",className:"is-min"},{id:"mrpControllers",tdClassName:"is-min"},"prodFlow","aor",{id:"prodLine",tdClassName:"is-min"},"reason","startedAt","finishedAt",{id:"duration",tdClassName:"is-min"}],serializeRows:function(){var e=this.options.simple?null:{changesCount:!0,maxReasonChanges:this.settings.getValue("maxReasonChanges")||Number.MAX_VALUE,maxAorChanges:this.settings.getValue("maxAorChanges")||Number.MAX_VALUE};return this.collection.map(function(t){return a(t,e)})},serializeActions:function(){if(this.options.simple)return null;var e=this.collection,i=this.settings.getCanChangeStatusOptions(),s=t("prodDowntimes","changesCount:rejected");return function(a){var r=e.get(a._id),o=[n.actions.viewDetails(r)];if(r.canCorroborate()){var c=r.canChangeStatus(i),d=t("prodDowntimes","LIST:ACTION:"+(c?"corroborate":"comment")),l=null,u=a.changesCount;u.rejected&&(l='<span title="'+s+'" class="label label-'+(u.rejected>=i.maxRejectedChanges?"danger":"warning")+'">'+u.rejected+"</span>"),o.unshift({id:"corroborate",icon:c?"gavel":"comment",label:d,href:r.genClientUrl()+"?corroborate=1",text:l})}return r.isEditable()&&i.canManageProdData&&o.push(n.actions.edit(r),n.actions["delete"](r)),o}},refreshIfMatches:function(e){this.collection.hasOrMatches(e)&&this.refreshCollection(e)},afterRender:function(){n.prototype.afterRender.call(this),this.scheduleDurationsUpdate()},scheduleDurationsUpdate:function(){clearTimeout(this.timers.updateDurations),this.timers.updateDurations=setTimeout(this.updateDurations.bind(this),15e3)},updateDurations:function(){var e=this,t=Date.now();this.$('td[data-id="duration"]').each(function(){var i=e.collection.get(this.parentNode.dataset.id);i.get("finishedAt")||(this.textContent=i.getDurationString(t))}),this.scheduleDurationsUpdate()}})});