// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../user","../router","../viewport","i18n!app/nls/reports"],function(e,r,t){var a=e.auth("REPORTS:VIEW");r.map("/reports/1",a,function(e){return t.currentPage&&"report1"===t.currentPage.pageId?t.currentPage.query.reset(e.query):void t.loadPage("app/reports/pages/Report1Page",function(r){return new r({query:e.query})})}),r.map("/reports/2",a,function(e){return t.currentPage&&"report2"===t.currentPage.pageId?t.currentPage.query.reset(e.query):void t.loadPage("app/reports/pages/Report2Page",function(r){return new r({query:e.query})})}),r.map("/reports/3",a,function(e){t.loadPage("app/reports/pages/Report3Page",function(r){return new r({query:e.rql})})}),r.map("/reports/4",a,function(e){t.loadPage("app/reports/pages/Report4Page",function(r){return new r({query:e.query})})}),r.map("/reports;metricRefs",e.auth("REPORTS:MANAGE"),function(e){t.loadPage("app/reports/pages/MetricRefsPage",function(r){return new r({initialTab:e.query.tab||"efficiency"})})})});