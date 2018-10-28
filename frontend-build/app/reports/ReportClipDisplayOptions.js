define(["underscore","../core/Model"],function(n,e){"use strict";var t=["clipOrderCount","clipProductionCount","clipEndToEndCount","clipProduction","clipEndToEnd"];return e.extend({defaults:function(){var n={series:{},extremes:"none",zeroes:"include",maxClipOrderCount:null,maxClipPercent:null,maxDelayReasonsCount:null,maxM4sCount:null,maxDrmsCount:null};return t.forEach(function(e){n.series[e]=!0}),n},initialize:function(n,e){if(!e.settings)throw new Error("settings option is required!");this.settings=e.settings},isSeriesVisible:function(n){return!!this.get("series")[n]},updateExtremes:function(n){var e={maxClipOrderCount:null,maxClipPercent:null,maxDelayReasonsCount:null,maxM4sCount:null,maxDrmsCount:null},t=this.get("extremes");if("none"===t)return this.set(e);for(var i=this.get("series"),r="siblings"===t?1:0,o=n.length;r<o;++r){var s=n[r],u=s.get("maxClip"),a=s.get("maxDelayReasons"),l=s.get("maxM4s"),c=s.get("maxDrms");e.maxClipOrderCount=Math.max(e.maxClipOrderCount,i.clipOrderCount?u.orderCount:0,i.clipProductionCount?u.productionCount:0,i.clipEndToEndCount?u.endToEndCount:0),e.maxClipPercent=Math.max(e.maxClipPercent,i.clipProduction?u.production:0,i.clipEndToEnd?u.endToEnd:0),e.maxDelayReasonsCount=Math.max(e.maxDelayReasonsCount,a),e.maxM4sCount=Math.max(e.maxM4sCount,l),e.maxDrmsCount=Math.max(e.maxDrmsCount,c)}this.set(e)},serializeToString:function(){var n=this.get("extremes"),e=this.get("zeroes"),i=this.get("series"),r=["none"===n?0:"siblings"===n?1:2,"","include"===e?0:"gap"===e?1:2];return t.forEach(function(n){r[1]+=i[n]?1:0}),r.join("&")}},{fromString:function(n,e){var i=n.split("&");if(i.length<2)return new this(null,e);var r={extremes:"2"===i[0]?"parent":"1"===i[0]?"siblings":"none",zeroes:"2"===i[2]?"ignore":"1"===i[2]?"gap":"include",series:{}},o=function(n,e){for(;n.length<e;)n="0"+n;return n}(i[1],t.length);return t.forEach(function(n,e){"1"===o[e]&&(r.series[n]=!0)}),new this(r,e)}})});