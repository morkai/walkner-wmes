define(["app/core/pages/DetailsPage","app/core/util/pageActions","../views/DetailsView","../views/HistoryView","app/wmes-fap-entries/templates/detailsPage"],function(e,i,t,s,a){"use strict";return e.extend({template:a,actions:function(){var e=[];return this.model.canDelete()&&e.push(i.delete(this.model,!1)),e},initialize:function(){e.prototype.initialize.apply(this,arguments),this.setView("#-properties",this.detailsView),this.setView("#-history",this.historyView)},defineViews:function(){this.detailsView=new t({model:this.model}),this.historyView=new s({model:this.model})}})});