// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../user","../core/Collection","./PressWorksheet"],function(r,e,t,s){return t.extend({model:s,rqlQuery:function(r){var t=[],s=e.getDivision();return s&&t.push({name:"eq",args:["divisions",s.id]}),r.Query.fromObject({fields:{orders:0,operators:0},sort:{date:-1},limit:15,selector:{name:"and",args:t}})},sync:function(e,s,i){if("read"===e&&!i.data){var n=r.find(this.rqlQuery.selector.args,function(r){return"eq"===r.name&&"user"===r.args[0]});n&&(this.rqlQuery.selector.args=r.without(this.rqlQuery.selector.args,n)),i.data=this.rqlQuery.toString(),n&&this.rqlQuery.selector.args.push(n)}return t.prototype.sync.call(this,e,s,i)}})});