// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../user","../router","../viewport"],function(r,e,t){"use strict";function n(r,e){t.loadPage(["app/reports/pages/Report"+r+"Page","i18n!app/nls/reports"],function(r){return new r({query:e.query,queryString:e.queryString,displayOptions:e.fragment})})}function u(e){return r.auth("REPORTS:VIEW","REPORTS:"+e+":VIEW")}e.map("/reports/1",u(1),function(r){return t.currentPage&&"report1"===t.currentPage.pageId?t.currentPage.query.reset(r.query):void n(1,r)}),e.map("/reports/2",u(2),function(r){return t.currentPage&&"report2"===t.currentPage.pageId?t.currentPage.query.reset(r.query):void n(2,r)}),e.map("/reports/3",u(3),function(r){n(3,r)}),e.map("/reports/4",u(4),function(r){n(4,r)}),e.map("/reports/5",u(5),function(r){return t.currentPage&&"report5"===t.currentPage.pageId?t.currentPage.query.reset(r.query):void n(5,r)}),e.map("/reports/6",u(6),function(r){return t.currentPage&&"report6"===t.currentPage.pageId?t.currentPage.query.reset(r.query):void n(6,r)}),e.map("/reports/7",u(7),function(r){n(7,r)}),e.map("/reports/8",u(8),function(r){n(8,r)}),e.map("/reports/9",u(9),function(r){n(9,r)}),e.map("/reports;settings",r.auth("REPORTS:MANAGE"),function(r){t.loadPage(["app/reports/pages/ReportSettingsPage","i18n!app/nls/reports"],function(e){return new e({initialTab:r.query.tab,initialSubtab:r.query.subtab})})})});