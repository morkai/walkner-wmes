// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../user","../router","../viewport"],function(n,a,e){"use strict";var t=n.auth();a.map("/kanban",t,function(){e.loadPage(["app/kanban/pages/KanbanEntryListPage","i18n!app/nls/kanban","i18n!app/nls/kanbanComponents"],function(n){return new n})})});