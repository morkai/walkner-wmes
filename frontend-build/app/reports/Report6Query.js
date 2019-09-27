define(["underscore","../time","../core/Model"],function(t,r,e){"use strict";return e.extend({defaults:{from:null,to:null,interval:"shift",parent:null},reset:function(r){this.set(t.defaults(this.constructor.prepareAttrsFromQuery(r),this.defaults),{reset:!0})},serializeToObject:function(){return{from:this.get("from"),to:this.get("to"),interval:this.get("interval"),parent:this.get("parent")}},serializeToString:function(t){var r="",e=this.attributes;return e.interval&&(r+="&interval="+e.interval),e.from&&e.to&&(r+="&from="+encodeURIComponent(e.from),r+="&to="+encodeURIComponent(e.to)),t?r+="&parent="+t:void 0===t&&e.parent&&(r+="&parent="+e.parent),r.substr(1)}},{prepareAttrsFromQuery:function(t){var e={};return t.from&&t.to?(e.from=+t.from,e.to=+t.to):(e.from=r.getMoment().subtract(1,"days").hours(0).startOf("hour").valueOf(),e.to=r.getMoment().hours(0).startOf("hour").valueOf()),t.interval&&(e.interval=t.interval),t.parent&&(e.parent=t.parent),e},fromQuery:function(t){return new this(this.prepareAttrsFromQuery(t))}})});