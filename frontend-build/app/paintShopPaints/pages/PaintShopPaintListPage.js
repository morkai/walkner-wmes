// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/util/pageActions","app/core/pages/ListPage","i18n!app/nls/paintShopPaints"],function(i,s){"use strict";return s.extend({baseBreadcrumb:!0,actions:function(){return[i.jump(this,this.collection,{mode:"id"}),i.add(this.collection,"PAINT_SHOP:MANAGE")]},columns:[{id:"_id",className:"is-min"},{id:"shelf",className:"is-min"},{id:"bin",className:"is-min"},"name"]})});