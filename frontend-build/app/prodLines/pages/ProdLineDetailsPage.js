define(["app/user","app/core/pages/DetailsPage","../views/ProdLineDetailsView"],function(e,t,i){"use strict";return t.extend({DetailsView:i,actions:function(){return this.model.get("deactivatedAt")&&!e.data.super?[]:t.prototype.actions.call(this)}})});