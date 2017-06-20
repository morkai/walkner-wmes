// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/core/views/DetailsView","app/kaizenOrders/dictionaries","app/behaviorObsCards/templates/details"],function(e,s,i,t){"use strict";return s.extend({template:t,serialize:function(){return e.extend(s.prototype.serialize.call(this),{showEasyDiscussed:this.model.hasAnyEasy()})}})});