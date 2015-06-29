// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../time","../core/Collection","./PurchaseOrder"],function(e,r,n){"use strict";return r.extend({model:n,rqlQuery:function(e){return e.Query.fromObject({fields:{changes:0,"items.prints":0},limit:20,sort:{scheduledAt:1},selector:{name:"and",args:[{name:"eq",args:["open",!0]},{name:"populate",args:["vendor"]}]}})}})});