// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/user","app/core/pages/DetailsPage","../views/ProdFlowDetailsView"],function(e,t,i){"use strict";return t.extend({DetailsView:i,actions:function(){return this.model.get("deactivatedAt")&&!e.data.super?[]:t.prototype.actions.call(this)}})});