// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./XiconfClient"],function(e,n){"use strict";return e.extend({model:n,rqlQuery:function(e){return e.Query.fromObject({fields:{},sort:{prodLine:1},limit:50,selector:{name:"and",args:[{name:"populate",args:["license",["features"]]}]}})}})});