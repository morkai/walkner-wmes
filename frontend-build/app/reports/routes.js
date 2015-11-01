// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../user","../router","../viewport","i18n!app/nls/reports"],function(e,r,t){"use strict";r.map("/reports/1",e.auth("REPORTS:VIEW","REPORTS:1:VIEW"),function(e){return t.currentPage&&"report1"===t.currentPage.pageId?t.currentPage.query.reset(e.query):void t.loadPage("app/reports/pages/Report1Page",function(r){return new r({query:e.query,displayOptions:e.fragment})})}),r.map("/reports/2",e.auth("REPORTS:VIEW","REPORTS:2:VIEW"),function(e){return t.currentPage&&"report2"===t.currentPage.pageId?t.currentPage.query.reset(e.query):void t.loadPage("app/reports/pages/Report2Page",function(r){return new r({query:e.query,displayOptions:e.fragment})})}),r.map("/reports/3",e.auth("REPORTS:VIEW","REPORTS:3:VIEW"),function(e){t.loadPage("app/reports/pages/Report3Page",function(r){return new r({query:e.rql})})}),r.map("/reports/4",e.auth("REPORTS:VIEW","REPORTS:4:VIEW"),function(e){t.loadPage("app/reports/pages/Report4Page",function(r){return new r({query:e.query})})}),r.map("/reports/5",e.auth("REPORTS:VIEW","REPORTS:5:VIEW"),function(e){return t.currentPage&&"report5"===t.currentPage.pageId?t.currentPage.query.reset(e.query):void t.loadPage("app/reports/pages/Report5Page",function(r){return new r({query:e.query,displayOptions:e.fragment})})}),r.map("/reports/6",e.auth("REPORTS:VIEW","REPORTS:6:VIEW"),function(e){return t.currentPage&&"report6"===t.currentPage.pageId?t.currentPage.query.reset(e.query):void t.loadPage("app/reports/pages/Report6Page",function(r){return new r({query:e.query,displayOptions:e.fragment})})}),r.map("/reports/7",e.auth("REPORTS:VIEW","REPORTS:7:VIEW"),function(e){t.loadPage("app/reports/pages/Report7Page",function(r){return new r({query:e.query})})}),r.map("/reports/8",e.auth("REPORTS:VIEW","REPORTS:8:VIEW"),function(e){t.loadPage("app/reports/pages/Report8Page",function(r){return new r({query:e.query})})}),r.map("/reports;settings",e.auth("REPORTS:MANAGE"),function(e){t.loadPage("app/reports/pages/ReportSettingsPage",function(r){return new r({initialTab:e.query.tab})})})});