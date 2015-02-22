// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FilterView","app/xiconfPrograms/templates/filter"],function(e,a){return e.extend({template:a,defaultFormData:{name:""},termToForm:{name:function(e,a,r){"regex"===a.name&&(r[e]=a.args[1])}},serializeFormToQuery:function(e){var a=this.$id("name").val().trim();a.length&&e.push({name:"regex",args:["name",a,"i"]})}})});