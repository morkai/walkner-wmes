// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/views/FilterView","app/pkhdStrategies/templates/filter"],function(e,t){"use strict";return e.extend({template:t,defaultFormData:{s:"",t:"",name:""},termToForm:{"_id.s":function(e,t,i){i.s=t.args[1]},"_id.t":function(e,t,i){i.t=t.args[1]},name:function(e,t,i){i[e]=this.unescapeRegExp(t.args[1])}},serializeFormToQuery:function(e){var t=this.$id("s").val().trim(),i=this.$id("t").val().trim();this.serializeRegexTerm(e,"name",null,null,!0,!1),/^[0-9]+$/.test(t)&&e.push({name:"eq",args:["_id.s",+t]}),/^[0-9]+$/.test(i)&&e.push({name:"eq",args:["_id.t",+i]})}})});