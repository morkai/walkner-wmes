define(["app/core/views/FilterView","app/mechOrders/templates/filter"],function(e,r){"use strict";return e.extend({template:r,defaultFormData:{_id:""},termToForm:{_id:function(e,r,t){var i=r.args[1];t[e]="string"==typeof i?i.replace(/[^0-9a-zA-Z]/g,""):""}},serializeFormToQuery:function(e){this.serializeRegexTerm(e,"_id",12,null,!1,!0)}})});