// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../user","../router","../viewport"],function(n,a,t){"use strict";var e=n.auth(),i=n.auth("KANBAN:MANAGE"),p="i18n!app/nls/kanban";a.map("/kanban",e,function(){t.loadPage(["app/kanban/pages/KanbanEntryListPage",p,"i18n!app/nls/kanbanComponents","i18n!app/nls/kanbanContainers"],function(n){return new n})}),a.map("/kanban;settings",i,function(n){t.loadPage(["app/kanban/pages/KanbanSettingsPage",p],function(a){return new a({initialTab:n.query.tab})})})});