define(["../router","../viewport","../user"],function(e,n,t){"use strict";e.map("/events",t.auth("EVENTS:VIEW"),function(e){n.loadPage(["app/events/pages/EventListPage","css!app/events/assets/main","i18n!app/nls/events"],function(n){return new n({rql:e.rql})})})});