// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/user","../core/Collection","./FteMasterEntry"],function(e,t,r){return t.extend({model:r,rqlQuery:function(t){var r;return e.data.orgUnitType&&"unspecified"!==e.data.orgUnitType&&(r={name:"and",args:[{name:"eq",args:[e.data.orgUnitType,e.data.orgUnitId]}]}),t.Query.fromObject({fields:{subdivision:1,date:1,shift:1,createdAt:1,creator:1},sort:{date:-1},limit:15,selector:r})}})});