// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/user","app/core/util/pageActions","app/core/pages/DetailsPage","../views/UserDetailsView"],function(e,i,t,s,n){"use strict";return s.extend({DetailsView:n,actions:function(){var s=this.model,n=[],a=i.isAllowedTo("USERS:MANAGE");return a?n.push(t.edit(s,!1),t["delete"](s,!1)):i.data._id===s.id&&n.push({label:e.bound("users","PAGE_ACTION:editAccount"),icon:"edit",href:s.genClientUrl("edit")}),n}})});