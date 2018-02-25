// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user"],function(e,a,r){"use strict";var i="i18n!app/nls/sapLaborTimeFixer",n=r.auth("SAP_LABOR_TIME_FIXER:VIEW");e.map("/sapLaborTimeFixer",n,function(e){a.loadPage(["app/sapLaborTimeFixer/pages/SapLaborTimeFixerPage",i],function(e){return new e})})});