// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../user","../core/Collection","./ProdChangeRequest"],function(e,r,n,t){"use strict";return n.extend({model:t,rqlQuery:function(e){var n=[{name:"eq",args:["status","new"]}],t=r.getDivision();return t&&n.push({name:"eq",args:["division",t.id]}),e.Query.fromObject({limit:20,sort:{prodLine:1,_id:1},selector:{name:"and",args:n}})},isNewStatus:function(){return e.some(this.rqlQuery.selector.args,function(e){return"status"===e.args[0]&&"new"===e.args[1]})}})});