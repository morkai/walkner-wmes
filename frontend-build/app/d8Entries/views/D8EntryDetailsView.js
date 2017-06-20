// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/core/views/DetailsView","app/d8Entries/templates/details","app/d8Entries/templates/strips"],function(e,t,i,r){"use strict";return t.extend({template:i,serialize:function(){return e.extend(t.prototype.serialize.call(this),{renderStrips:r})}})});