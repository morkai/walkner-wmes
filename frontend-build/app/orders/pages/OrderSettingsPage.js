// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../settings","../views/OrderSettingsView"],function(e,i,t,n,s){"use strict";return t.extend({layoutName:"page",breadcrumbs:function(){return[{label:e.bound("orders","BREADCRUMBS:browse"),href:"#orders"},e.bound("orders","BREADCRUMBS:settings")]},initialize:function(){this.defineModels(),this.defineViews()},destroy:function(){n.release()},defineModels:function(){this.model=i(n.acquire(),this)},defineViews:function(){this.view=new s({initialTab:this.options.initialTab,settings:this.model})},load:function(e){return this.model.isEmpty()?e(this.model.fetch({reset:!0})):e()},afterRender:function(){n.acquire()}})});