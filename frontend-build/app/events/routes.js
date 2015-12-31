// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user"],function(e,n,t){"use strict";e.map("/events",t.auth("EVENTS:VIEW"),function(e){n.loadPage(["app/events/pages/EventListPage","i18n!app/nls/events"],function(n){return new n({rql:e.rql})})})});