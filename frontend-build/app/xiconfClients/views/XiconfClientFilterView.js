// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/core/views/FilterView","app/xiconfClients/templates/filter"],function(t,e,n){"use strict";return e.extend({template:n,defaultFormData:function(){return{status:["online","offline"]}},termToForm:{connectedAt:function(t,e,n){n.status=["offline"]},disconnectedAt:function(t,e,n){n.status=["online"]},prodLine:function(t,e,n){n.prodLine=e.args[1]}},afterRender:function(){e.prototype.afterRender.call(this),this.toggleButtonGroup("status")},serializeFormToQuery:function(t){var e=this.getButtonGroupValue("status"),n=this.$id("prodLine").val().trim();1===e.length&&t.push({name:"eq",args:["online"===e[0]?"disconnectedAt":"connectedAt",null]}),n.length&&t.push({name:"regex",args:["prodLine",n,"i"]})}})});