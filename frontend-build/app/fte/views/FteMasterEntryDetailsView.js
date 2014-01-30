define(["underscore","app/core/View","app/fte/templates/masterEntry","app/fte/templates/absentUserRow","./fractionsUtil","i18n!app/nls/fte"],function(e,t,n,i,r){return t.extend({template:n,idPrefix:"masterEntryDetails",initialize:function(){this.lastRefreshAt=0;var e=this;this.listenToOnce(this.model,"sync",function(){e.model.get("locked")||e.pubsub.subscribe("fte.master.updated."+e.model.id,this.refreshModel.bind(this))})},serialize:function(){return e.extend(this.model.serializeWithTotals(),{editable:!1,renderAbsentUserRow:i,round:r.round})},afterRender:function(){this.listenToOnce(this.model,"change",this.render);var e=this.$(".fte-masterEntry-absence-entries"),t=this.$(".fte-masterEntry-absence-noEntries");e.children().length?t.hide():e.hide()},refreshModel:function(){var e=Date.now(),t=e-this.lastRefreshAt;1e3>t?this.timers.refresh||(this.timers.refresh=setTimeout(this.refreshModel.bind(this),1e3-t)):(this.lastRefreshAt=Date.now(),delete this.timers.refresh,this.promised(this.model.fetch()))}})});