define(["../user","../router","../viewport"],function(r,e,t){"use strict";function n(r,e,n){var p=["app/reports/pages/Report"+r+"Page","i18n!app/nls/reports"];n&&(p=p.concat(n)),t.loadPage(p,function(r){return new r({query:e.query,queryString:e.queryString,rql:e.rql,displayOptions:e.fragment})})}function p(e){return r.auth("REPORTS:VIEW","REPORTS:"+e+":VIEW")}e.map("/reports/1",p(1),function(r){if(t.currentPage&&"report1"===t.currentPage.pageId)return t.currentPage.query.reset(r.query);n(1,r)}),e.map("/reports/clip",p(2),function(r){if(t.currentPage&&"clipReport"===t.currentPage.pageId)return t.currentPage.query.reset(r.query);n("Clip",r,["i18n!app/nls/orders"])}),e.map("/reports/3",p(3),function(r){n(3,r)}),e.map("/reports/4",p(4),function(r){n(4,r,["i18n!app/nls/pressWorksheets"])}),e.map("/reports/5",p(5),function(r){if(t.currentPage&&"report5"===t.currentPage.pageId)return t.currentPage.query.reset(r.query);n(5,r)}),e.map("/reports/6",p(6),function(r){if(t.currentPage&&"report6"===t.currentPage.pageId)return t.currentPage.query.reset(r.query);n(6,r)}),e.map("/reports/7",p(7),function(r){n(7,r)}),e.map("/reports/8",p(8),function(r){n(8,r)}),e.map("/reports/9",p(9),function(r){n(9,r)}),e.map("/reports;settings",r.auth("REPORTS:MANAGE"),function(r){t.loadPage(["app/reports/pages/ReportSettingsPage","i18n!app/nls/reports"],function(e){return new e({initialTab:r.query.tab,initialSubtab:r.query.subtab})})})});