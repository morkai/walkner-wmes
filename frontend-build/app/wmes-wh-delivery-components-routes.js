define(["./router","./viewport","./user","./wh/pages/WhDeliveryPage","i18n!app/nls/wh","i18n!app/nls/wh-lines","i18n!app/nls/planning","i18n!app/nls/paintShop"],function(n,e,p,a){"use strict";n.map("/",p.auth("LOCAL","WH:VIEW"),function(){e.showPage(new a({layoutName:"blank",kind:"components"}))})});