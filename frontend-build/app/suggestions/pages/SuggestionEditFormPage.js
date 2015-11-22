// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/pages/EditFormPage","app/kaizenOrders/dictionaries","../views/SuggestionFormView"],function(e,t,r){"use strict";return e.extend({baseBreadcrumb:!0,FormView:r,load:function(e){return e(this.model.fetch(),t.load())},destroy:function(){e.prototype.destroy.call(this),t.unload()},afterRender:function(){e.prototype.afterRender.call(this),t.load()}})});