// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FilterView","app/prodDowntimeAlerts/templates/filter"],function(e,t){"use strict";return e.extend({template:t,defaultFormData:function(){return{name:""}},termToForm:{name:function(e,t,r){r[e]=t.args[1].replace(/\\(.)/g,"$1")}},serializeFormToQuery:function(e){this.serializeRegexTerm(e,"name",-1,null,!0)}})});