// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./PurchaseOrder"],function(e,r){return e.extend({model:r,rqlQuery:function(e){return e.Query.fromObject({fields:{changes:0},limit:15,sort:{"items.schedule.date":1},selector:{name:"and",args:[{name:"eq",args:["open",!0]},{name:"populate",args:["vendor"]}]}})}})});