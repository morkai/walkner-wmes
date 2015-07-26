// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/data/aors","app/data/downtimeReasons","app/data/divisions","app/data/views/renderOrgUnitPath"],function(a,t,i,e,n){"use strict";return function(o){var s=o.toJSON();s.division=n(e.get(s.division),!0,!1),s.type=a("subdivisions","TYPE:"+s.type),s.prodTaskTags=s.prodTaskTags&&s.prodTaskTags.length?s.prodTaskTags.join("; "):null;var r=t.get(s.aor);s.aor=r?r.getLabel():"-";var p=i.get(s.autoDowntime);return s.autoDowntime=p?p.getLabel():"-",s}});