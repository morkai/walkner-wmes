// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FilterView","app/mechOrders/templates/filter"],function(e,r){"use strict";return e.extend({template:r,defaultFormData:{_id:""},termToForm:{_id:function(e,r,t){var i=r.args[1];t[e]="string"==typeof i?i.replace(/[^0-9a-zA-Z]/g,""):""}},serializeFormToQuery:function(e){this.serializeRegexTerm(e,"_id",12)}})});