// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/user","app/core/pages/DetailsPage","../views/ProdFlowDetailsView"],function(e,t,i){"use strict";return t.extend({DetailsView:i,actions:function(){return this.model.get("deactivatedAt")&&!e.data["super"]?[]:t.prototype.actions.call(this)}})});