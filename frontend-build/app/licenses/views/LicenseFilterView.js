// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FilterView","app/licenses/templates/filter"],function(e,i){"use strict";return e.extend({template:i,defaultFormData:{_id:"",appId:""},termToForm:{_id:function(e,i,a){a[e]=i.args[1]},appId:"_id"},serializeFormToQuery:function(e){var i=this.$id("appId").val();i&&e.push({name:"eq",args:["appId",i]}),this.serializeRegexTerm(e,"_id",32,/[^0-9a-fA-F-]/g)}})});