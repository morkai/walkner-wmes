// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./OrderStatus"],function(r,e){return r.extend({model:e,rqlQuery:"select(label,color)&sort(_id)",findAndFill:function(r){var n=this;return Array.isArray(r)?r.map(function(r){var t=n.get(r);return t||(t=new e({_id:r})),t.toJSON()}):[]}})});