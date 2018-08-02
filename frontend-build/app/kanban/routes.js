// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../user","../router","../viewport"],function(n,a,e){"use strict";var p=n.auth();a.map("/kanban",p,function(){e.loadPage(["app/kanban/pages/KanbanEntryListPage","i18n!app/nls/kanban","i18n!app/nls/kanbanSupplyAreas"],function(n){return new n})})});