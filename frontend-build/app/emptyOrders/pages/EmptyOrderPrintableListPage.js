// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","moment","app/i18n","app/core/util/bindLoadingMessage","app/core/util/pageActions","app/core/View","../EmptyOrderCollection","../views/EmptyOrderPrintableListView"],function(e,t,r,i,n,o,l,s){return o.extend({layoutName:"print",pageId:"emptyOrderPrintableList",hdLeft:function(){var i=e.find(this.collection.rqlQuery.selector.args,function(e){return"eq"===e.name&&("startDate"===e.args[0]||"finishDate"===e.args[0])});return i?r("emptyOrders","PRINT_PAGE:HD:LEFT:"+i.args[0],{date:t(i.args[1]).format("LL")}):r("emptyOrders","PRINT_PAGE:HD:LEFT:all")},breadcrumbs:[r.bound("emptyOrders","BREADCRUMBS:browse")],initialize:function(){this.collection=i(new l(null,{rqlQuery:this.options.rql}),this),this.collection.rqlQuery.limit=-1,this.view=new s({collection:this.collection})},load:function(e){return e(this.collection.fetch({reset:!0}))}})});