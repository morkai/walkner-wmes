// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./PurchaseOrderPrint"],function(t,e){return t.extend({model:e,comparator:"_id",initialize:function(){this.byKey={},this.byItem={},this.on("reset change add",function(){this.byKey={},this.byItem={};for(var t=0,e=this.length;e>t;++t){var i=this.models[t],h=i.get("key"),s=i.get("item");void 0===this.byKey[h]?this.byKey[h]=[i]:this.byKey[h].push(i),void 0===this.byItem[s]?this.byItem[s]=[i]:this.byItem[s].push(i)}})}})});