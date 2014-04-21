// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../router","../viewport","../user","i18n!app/nls/events"],function(e,n,t){e.map("/events",t.auth("EVENTS:VIEW"),function(e){n.loadPage("app/events/pages/EventListPage",function(n){return new n({rql:e.rql})})})});