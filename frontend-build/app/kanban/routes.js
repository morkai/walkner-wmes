// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../user","../router","../viewport"],function(n,a,t){"use strict";var e=n.auth("KANBAN:VIEW");n.auth("KANBAN:MANAGE");a.map("/kanban",e,function(){t.loadPage(["app/kanban/pages/KanbanEntryListPage","i18n!app/nls/kanban"],function(n){return new n})})});