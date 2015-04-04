// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/user","app/core/views/ListView","../util/renderOrderStatusLabel"],function(e,i,r,t){"use strict";return r.extend({className:"is-shrinked is-clickable",serializeColumns:function(){return[{id:"coloredId",label:e("orderStatuses","PROPERTY:_id")},{id:"label",label:e("orderStatuses","PROPERTY:label")}]},serializeRows:function(){return this.collection.toJSON().map(function(e){return e.coloredId=t(e),e})}})});