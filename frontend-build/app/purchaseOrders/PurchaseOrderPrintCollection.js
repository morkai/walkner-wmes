// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./PurchaseOrderPrint"],function(t,e){"use strict";return t.extend({model:e,comparator:"_id",initialize:function(){this.byKey={},this.byItem={},this.on("reset change add",function(){this.byKey={},this.byItem={};for(var t=0,e=this.length;e>t;++t){var i=this.models[t],s=i.get("key"),h=i.get("item");void 0===this.byKey[s]?this.byKey[s]=[i]:this.byKey[s].push(i),void 0===this.byItem[h]?this.byItem[h]=[i]:this.byItem[h].push(i)}})}})});