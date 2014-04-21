// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./OrderStatus"],function(e,n){return e.extend({model:n,rqlQuery:"select(label,color)&sort(_id)",findAndFill:function(e){var r=this;return e.map(function(e){var t=r.get(e);return t||(t=new n({_id:e})),t.toJSON()})}})});