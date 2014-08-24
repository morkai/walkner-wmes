// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../user","../router","../viewport","i18n!app/nls/factoryLayout"],function(a,o,t){var r=a.auth("FACTORY_LAYOUT:VIEW");o.map("/factoryLayout",r,function(){t.loadPage("app/factoryLayout/pages/FactoryLayoutPage")})});