// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/pages/ListPage","../views/MrpControllerListView"],function(t,e,i){"use strict";return e.extend({ListView:i,actions:function(){var i=this;return[{label:t.bound("mrpControllers","PAGE_ACTION:toggleDeactivated"),icon:"toggle-on",className:"active",callback:function(){var t=this.querySelector(".btn");return t.classList.toggle("active"),i.view.toggleDeactivated(!t.classList.contains("active")),!1}}].concat(e.prototype.actions.call(this))}})});