// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../settings","../views/XiconfSettingsView"],function(e,i,n,t,s){"use strict";return n.extend({layoutName:"page",breadcrumbs:function(){return[{label:e.bound("xiconf","BREADCRUMBS:base")},e.bound("xiconf","BREADCRUMBS:settings")]},initialize:function(){this.defineModels(),this.defineViews()},destroy:function(){t.release()},defineModels:function(){this.model=i(t.acquire(),this)},defineViews:function(){this.view=new s({initialTab:this.options.initialTab,settings:this.model})},load:function(e){return this.model.isEmpty()?e(this.model.fetch({reset:!0})):e()},afterRender:function(){t.acquire()}})});