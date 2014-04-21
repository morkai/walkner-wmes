// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../core/Collection","./PressWorksheet"],function(r,e,t){return e.extend({model:t,rqlQuery:"select(rid,type,date,shift,master,operator,createdAt,creator)&sort(-date)&limit(15)",sync:function(t,s,o){if("read"===t&&!o.data){var a=r.find(this.rqlQuery.selector.args,function(r){return"eq"===r.name&&"user"===r.args[0]});a&&(this.rqlQuery.selector.args=r.without(this.rqlQuery.selector.args,a)),o.data=this.rqlQuery.toString(),a&&this.rqlQuery.selector.args.push(a)}return e.prototype.sync.call(this,t,s,o)}})});