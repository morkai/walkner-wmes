// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../i18n","../core/Collection","./EventType"],function(e,t,n){"use strict";return t.extend({model:n,parse:function(t){return t.map(function(t){return{_id:t,text:e.bound("events","TYPE:"+t)}})},comparator:"text"})});