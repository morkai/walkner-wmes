// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/user","app/core/View","app/core/views/LogInFormView","../views/DashboardView"],function(e,i,n,o,r){"use strict";return n.extend({layoutName:"page",pageId:"dashboard",localTopics:{"user.reloaded":function(){this.view.remove(),this.view=i.isLoggedIn()?new r:new o,this.view.render()}},breadcrumbs:function(){return i.isLoggedIn()?[]:[e.bound("dashboard","breadcrumbs:logIn")]},initialize:function(){this.view=i.isLoggedIn()?new r:new o},afterRender:function(){i.isLoggedIn()||this.$('input[name="login"]').focus()}})});