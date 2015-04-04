// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/data/aors","app/data/divisions","app/data/views/renderOrgUnitPath"],function(a,i,s,n){"use strict";return function(t){var r=t.toJSON();r.division=n(s.get(r.division),!0,!1),r.type=a("subdivisions","TYPE:"+r.type),r.prodTaskTags=r.prodTaskTags&&r.prodTaskTags.length?r.prodTaskTags.join("; "):null;var e=i.get(r.aor);return r.aor=e?e.getLabel():null,r}});