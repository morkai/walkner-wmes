// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FilterView","app/users/templates/filter"],function(e,r){"use strict";return e.extend({template:r,defaultFormData:{personellId:"",lastName:""},termToForm:{personellId:function(e,r,a){"regex"===r.name&&(a[e]=r.args[1].replace("^",""))},lastName:"personellId"},serializeFormToQuery:function(e){var r=parseInt(this.$id("personellId").val().trim(),10),a=this.$id("lastName").val().trim();isNaN(r)||e.push({name:"regex",args:["personellId","^"+r,"i"]}),a.length&&e.push({name:"regex",args:["lastName","^"+a,"i"]})}})});