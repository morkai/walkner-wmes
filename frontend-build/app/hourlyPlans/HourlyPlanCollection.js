// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/user","../core/Collection","./HourlyPlan"],function(e,r,i){return r.extend({model:i,rqlQuery:function(r){var i,t=e.getDivision();return t&&(i={name:"and",args:[{name:"eq",args:["division",t.id]}]}),r.Query.fromObject({fields:{division:1,date:1,shift:1,createdAt:1,creator:1},sort:{date:-1},limit:15,selector:i})}})});