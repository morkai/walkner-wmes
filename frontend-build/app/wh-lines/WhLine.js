define(["app/core/Model"],function(e){"use strict";return e.extend({urlRoot:"/old/wh/lines",clientUrlRoot:"#wh/lines",topicPrefix:"old.wh.lines",privilegePrefix:"WH",nlsDomain:"wh-lines",defaults:function(){return{pickup:{sets:0,qty:0,time:0},components:{qty:0,time:0},packaging:{qty:0,time:0},redirLine:null,working:!1}},serialize:function(){return this.toJSON()}})});