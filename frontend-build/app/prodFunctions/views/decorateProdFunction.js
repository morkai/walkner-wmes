// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/data/companies"],function(n,e){return function(t){var i=t.toJSON();return i.direct=n("prodFunctions","direct:"+i.direct),i.companies=(i.companies||[]).map(function(n){var t=e.get(n);return t?t.getLabel():null}).filter(function(n){return!!n}).join("; "),i.companies.length||(i.companies="-"),i}});