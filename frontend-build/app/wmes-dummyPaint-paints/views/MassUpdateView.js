define(["app/core/views/FormView","app/wmes-dummyPaint-paints/templates/massUpdate"],function(t,e){"use strict";return t.extend({template:e,request:function(t){return this.ajax({method:"POST",url:"/dummyPaint/paints;massUpdate",data:JSON.stringify(t)})}})});