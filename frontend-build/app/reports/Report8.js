// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../data/companies","../data/prodFunctions","../core/Model"],function(e,t,r,i){"use strict";return i.extend({urlRoot:"/reports/8",initialize:function(e,t){if(!t.query)throw new Error("query option is required!");this.query=t.query},fetch:function(t){return e.isObject(t)||(t={}),t.data=e.extend(t.data||{},this.query.serializeToObject()),i.prototype.fetch.call(this,t)}})});