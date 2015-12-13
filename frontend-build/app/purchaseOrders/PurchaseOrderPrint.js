// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../i18n","../core/Model"],function(r,e){"use strict";return e.extend({serialize:function(){var e=this.toJSON();"browser"===e.printer&&(e.printer=r("purchaseOrders","printer:browser")),e.barcodeText=r("purchaseOrders","barcode:"+e.barcode);var p=e.paper.match(/^vendor\/(.*?)\/(.*?)$/);return null===p?e.paperText=r("purchaseOrders","paper:"+e.paper):e.paperText=r("purchaseOrders","paper:vendor",{vendorNo:p[1],paper:p[2]}),e}})});