define(["underscore","app/core/views/DetailsView","app/d8Entries/templates/details","app/d8Entries/templates/strips"],function(e,t,i,s){"use strict";return t.extend({template:i,serialize:function(){return e.assign(t.prototype.serialize.call(this),{renderStrips:s})}})});