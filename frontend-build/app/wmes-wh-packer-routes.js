// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["./router","./viewport","./user","./wh/pages/WhCartsPage","i18n!app/nls/wh","i18n!app/nls/planning","i18n!app/nls/paintShop"],function(n,e,p,a){"use strict";n.map("/",p.auth("LOCAL","WH:VIEW"),function(){e.showPage(new a({func:"packer",fullscreen:!0}))})});