define(["./router","./viewport","./user","./wh/pages/WhCartsPage","i18n!app/nls/wh","i18n!app/nls/planning","i18n!app/nls/paintShop"],function(n,e,p,a){"use strict";n.map("/",p.auth("LOCAL","WH:VIEW"),function(){e.showPage(new a({func:"kitter",fullscreen:!0}))})});