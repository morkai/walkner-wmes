// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/broker","app/user","app/router","app/viewport","./pages/DashboardPage","i18n!app/nls/dashboard"],function(a,e,p,r,n,o){"use strict";r.map("/",function(){n.showPage(new o)})});