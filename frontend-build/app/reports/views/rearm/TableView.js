define(["app/time","app/core/View","app/reports/templates/rearm/table"],function(e,t,r){"use strict";return t.extend({template:r,getTemplateData:function(){return{orders:this.line.get("orders")}}})});