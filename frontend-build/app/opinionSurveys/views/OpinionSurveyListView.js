define(["app/i18n","app/core/views/ListView"],function(i,e){"use strict";return e.extend({className:"is-clickable",columns:[{id:"_id",className:"is-min"},{id:"startDate",className:"is-min"},{id:"endDate",className:"is-min"},"label"],serializeActions:function(){var n=this.collection;return function(t){var s=n.get(t._id);return[e.actions.viewDetails(s),{id:"print",icon:"print",label:i(s.getNlsDomain(),"LIST:ACTION:print"),href:"/opinionSurveys/"+s.id+".pdf"},e.actions.edit(s),e.actions.delete(s)]}}})});