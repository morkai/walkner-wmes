// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/data/aors","app/data/divisions","app/data/views/renderOrgUnitPath"],function(a,i,n,s){return function(r){var t=r.toJSON();t.division=s(n.get(t.division),!0,!1),t.type=a("subdivisions","TYPE:"+t.type),t.prodTaskTags=t.prodTaskTags&&t.prodTaskTags.length?t.prodTaskTags.join("; "):null;var o=i.get(t.aor);return t.aor=o?o.getLabel():null,t}});