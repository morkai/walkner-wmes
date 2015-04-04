// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FilterView","app/xiconfPrograms/templates/filter"],function(e,r){"use strict";return e.extend({template:r,defaultFormData:{name:""},termToForm:{name:function(e,r,a){"regex"===r.name&&(a[e]=r.args[1])}},serializeFormToQuery:function(e){var r=this.$id("name").val().trim();r.length&&e.push({name:"regex",args:["name",r,"i"]})}})});