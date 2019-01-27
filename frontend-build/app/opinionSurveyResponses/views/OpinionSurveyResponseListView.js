define(["underscore","app/i18n","app/time","app/user","app/viewport","app/core/views/ListView"],function(i,s,e,n,a,r){"use strict";var o={yes:"thumbs-up",no:"thumbs-down",na:"question",null:"circle-o"};return r.extend({className:"is-clickable",serializeColumns:function(){var s=[{id:"survey",className:"is-min"},{id:"division",className:"is-min"},{id:"superior",className:"is-min"},{id:"employer",className:"is-min"}],e={},n=this.opinionSurveys;return i.forEach(this.collection.usedSurveyIds,function(i){var a=n.get(i);a&&a.get("questions").forEach(function(i){e[i._id]||(s.push({id:"Q-"+i._id,label:i.short,thClassName:"is-min",tdClassName:"is-min opinionSurveyResponses-answer",noData:""}),e[i._id]=!0)})}),s.push({id:"null",label:"&nbsp;",noData:""}),s},serializeRows:function(){var i=this.opinionSurveys;return this.collection.map(function(s){var e=i.get(s.get("survey")),n=s.serialize(e);return s.get("answers").forEach(function(i){n["Q-"+i.question]=o[i.answer]?'<i class="fa fa-'+o[i.answer]+'"></i>':i.answer}),n})}})});