// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/pages/DetailsPage","../views/PfepEntryDetailsView","../views/PfepEntryHistoryView","app/pfepEntries/templates/detailsPage"],function(e,i,t,s,p){"use strict";return i.extend({template:p,baseBreadcrumb:!0,initialize:function(){i.prototype.initialize.apply(this,arguments),this.setView("#-properties",this.detailsView),this.setView("#-history",this.historyView)},defineViews:function(){this.detailsView=new t({model:this.model}),this.historyView=new s({model:this.model})}})});