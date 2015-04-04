// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./Order"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:function(e){var t=new Date;return t.setHours(0),t.setMinutes(0),t.setSeconds(0),t.setMilliseconds(0),e.Query.fromObject({fields:{nc12:1,name:1,mrp:1,qty:1,unit:1,startDate:1,finishDate:1,statuses:1},limit:15,sort:{finishDate:1},selector:{name:"and",args:[{name:"ge",args:["finishDate",t.getTime()]}]}})}})});