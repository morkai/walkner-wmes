// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FilterView","app/users/templates/filter"],function(e,a){return e.extend({template:a,defaultFormData:{personellId:"",lastName:""},termToForm:{personellId:function(e,a,r){"regex"===a.name&&(r[e]=a.args[1].replace("^",""))},lastName:"personellId"},serializeFormToQuery:function(e){var a=parseInt(this.$id("personellId").val().trim(),10),r=this.$id("lastName").val().trim();isNaN(a)||e.push({name:"regex",args:["personellId","^"+a,"i"]}),r.length&&e.push({name:"regex",args:["lastName","^"+r,"i"]})}})});