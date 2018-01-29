// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["./router","./viewport","./user","./paintShop/pages/PaintShopLoadPage","i18n!app/nls/paintShop"],function(n,a,e,p){"use strict";n.map("/",e.auth("LOCAL","PAINT_SHOP:VIEW"),function(){a.showPage(new p)})});