// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/user","app/core/pages/EditFormPage","../views/UserFormView"],function(e,r,o,s){"use strict";return o.extend({FormView:s,breadcrumbs:function(){return r.isAllowedTo("USERS:VIEW")?o.prototype.breadcrumbs.call(this):[{label:e.bound("users","BREADCRUMBS:myAccount"),href:this.model.genClientUrl()},e.bound("users","BREADCRUMBS:editForm")]}})});