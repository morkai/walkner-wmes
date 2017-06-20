// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model"],function(t){"use strict";return t.extend({urlRoot:"/vis/nodePositions",same:function(t,n){return Math.round(t)===Math.round(this.attributes.x)&&Math.round(n)===Math.round(this.attributes.y)}})});