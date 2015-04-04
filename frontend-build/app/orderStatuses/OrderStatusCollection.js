// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./OrderStatus"],function(r,e){"use strict";return r.extend({model:e,rqlQuery:"select(label,color)&sort(_id)",findAndFill:function(r){var t=this;return Array.isArray(r)?r.map(function(r){var n=t.get(r);return n||(n=new e({_id:r})),n.toJSON()}):[]}})});