define(["app/core/views/FilterView","app/wmes-dummyPaint-orders/dictionaries","app/wmes-dummyPaint-paints/templates/filter"],function(e,i,t){"use strict";return e.extend({template:t,termToForm:{code:function(e,i,t){t[e]=i.args[1]},family:"code",nc12:function(e,i,t){t[e]=this.unescapeRegExp(i.args[1])},name:"nc12"},serializeFormToQuery:function(e){this.serializeEqTerm(e,"code","eq",null),this.serializeEqTerm(e,"family","eq",null),this.serializeRegexTerm(e,"nc12",12,null,!0,!1),this.serializeRegexTerm(e,"name",60,null,!0,!1)},afterRender:function(){e.prototype.afterRender.apply(this,arguments),this.$id("code").select2({allowClear:!0,placeholder:" ",data:i.paintCodes.map(function(e){return{id:e,text:e}})}),this.$id("family").select2({allowClear:!0,placeholder:" ",data:i.paintFamilies.map(function(e){return{id:e,text:e}})})}})});