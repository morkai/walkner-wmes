// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/core/views/FilterView","app/paintShopPaints/templates/filter"],function(e,i,n){"use strict";return i.extend({template:n,defaultFormData:{_id:"",shelf:"",bin:"",name:""},termToForm:{_id:function(e,i,n){"regex"===i.name&&(n[e]=this.unescapeRegExp(i.args[1]))},shelf:"_id",bin:"_id",name:"_id"},serializeFormToQuery:function(e){var i=this;["_id","shelf","bin","name"].forEach(function(n){i.serializeRegexTerm(e,n,-1,null,!0,!1)})}})});