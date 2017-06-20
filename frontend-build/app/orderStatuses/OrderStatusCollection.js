// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./OrderStatus"],function(r,e){"use strict";return r.extend({model:e,rqlQuery:"select(label,color)&sort(_id)",findAndFill:function(r){var t=this;return Array.isArray(r)?r.map(function(r){var n=t.get(r);return n||(n=new e({_id:r})),n.toJSON()}):[]}})});