define(["app/core/views/FilterView","app/orderBomMatchers/templates/filter"],function(e,t){"use strict";return e.extend({template:t,defaultFormData:{description:""},termToForm:{description:function(e,t,i){i[e]=this.unescapeRegExp(t.args[1])}},serializeFormToQuery:function(e){this.serializeRegexTerm(e,"description",null,null,!0,!1)}})});