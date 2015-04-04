// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../XiconfResult","../views/XiconfResultDetailsView","app/xiconf/templates/downloadAction"],function(e,t,i,o,n,s){"use strict";return i.extend({layoutName:"page",pageId:"xiconfResultDetails",remoteTopics:{"xiconf.results.synced":function(e){var t=this.model.get("order");Array.isArray(e.orders)&&t&&-1!==e.orders.indexOf(t._id)&&this.promised(this.model.fetch())}},breadcrumbs:function(){return[e.bound("xiconf","BREADCRUMBS:base"),{label:e.bound("xiconf","BREADCRUMBS:browse"),href:this.model.genClientUrl("base")},e.bound("xiconf","BREADCRUMBS:details")]},actions:function(){var e=this.model.get("workflow"),t=this.model.get("feature"),i=this.model.url()+";";return[{template:function(){return s({workflow:"string"==typeof e&&e.length?i+"workflow":null,feature:"string"==typeof t&&t.length?i+"feature":null})}}]},initialize:function(){this.model=t(new o({_id:this.options.modelId}),this),this.view=new n({model:this.model,tab:this.options.tab})},load:function(e){return e(this.model.fetch())}})});