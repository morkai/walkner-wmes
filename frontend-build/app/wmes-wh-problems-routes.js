define(["./router","./viewport","./user","./wh/pages/WhProblemsPage","i18n!app/nls/wh","i18n!app/nls/planning","i18n!app/nls/paintShop"],function(n,e,a,p){"use strict";n.map("/",a.auth("LOCAL","WH:VIEW"),function(n){e.showPage(new p({returnDate:n.query.returnDate}))})});