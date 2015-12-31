// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/user","app/viewport","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","app/data/orgUnits","../FteMasterEntry","../views/FteMasterEntryDetailsView","./FteLeaderEntryDetailsPage"],function(e,t,r,a,n,i,s,o,d,p,u){"use strict";return u.extend({modelType:"fteMaster",pageId:"fteMasterEntryDetails",breadcrumbs:[{label:t.bound("fte","BREADCRUMBS:master:browse"),href:"#fte/master"},t.bound("fte","BREADCRUMBS:details")],createModel:function(){return new d({_id:this.options.modelId})},createView:function(){return new p({model:this.model})}})});