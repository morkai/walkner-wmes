// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/Model"],function(e){"use strict";return e.extend({url:"/reports/clip/planners",defaults:function(){return{users:{},mrps:{}}},initialize:function(){this.cache={},this.on("request",function(){this.cache={}})},getLabel:function(e){if(this.cache[e])return this.cache[e];var t=this.get("mrps")[e];if(!t||!t.length)return this.cache[e]="-";var r=this.get("users"),n=t.map(function(e,t){return r[e].i=t,r[e]}).sort(function(e,t){return e.presence===t.presence?e.i-t.i:t.presence-e.presence})[0];return this.cache[e]=n.lastName+" "+n.firstName}})});