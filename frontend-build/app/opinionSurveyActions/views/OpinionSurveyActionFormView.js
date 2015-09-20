// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/time","app/user","app/core/views/FormView","app/core/util/idAndLabel","app/users/util/setUpUserSelect2","app/opinionSurveys/dictionaries","app/opinionSurveys/util/formatQuestionResult","app/opinionSurveyActions/templates/form"],function(e,t,i,s,n,r,o,a,u,d){"use strict";function l(e){return{id:e.id,label:e.text.replace(/\s*\(.*?\)$/,"")}}return n.extend({template:d,events:e.extend({"change #-survey":function(e){this.selectSurvey(e.added.id)},"change #-division":function(e){this.selectDivision(e.added.id)},"change #-questionList":function(e){e.added&&this.$id("question").val(e.added.full).focus()}},n.prototype.events),serializeToForm:function(){var e=this.model.toJSON();return e.owners=e.owners?e.owners.map(function(e){return e.id}).join(","):"",e.superior=e.superior?e.superior.id:"",e.startDate=e.startDate?i.format(e.startDate,"YYYY-MM-DD"):"",e.endDate=e.endDate?i.format(e.endDate,"YYYY-MM-DD"):"",e},serializeForm:function(e){return e.superior=l(this.$id("superior").select2("data")),e.owners=this.$id("owners").select2("data").map(l),e.startDate=e.startDate?i.getMoment(e.startDate,"YYYY-MM-DD").toISOString():"",e.endDate=e.endDate?i.getMoment(e.endDate,"YYYY-MM-DD").toISOString():"",e},afterRender:function(){if(n.prototype.afterRender.call(this),this.$id("survey").select2({minimumResultsForSearch:5,data:this.model.surveys.map(r)}),o(this.$id("superior"),{view:this,textFormatter:function(e,t,i){return e.personellId&&i&&/^[0-9]+$/.test(i.term)?t+=" ("+e.personellId+")":"division"===e.orgUnitType&&(t+=" ("+e.orgUnitId+")"),t}}),this.$id("status").select2({minimumResultsForSearch:-1,data:a.actionStatuses.map(function(e){return{id:e,text:t("opinionSurveyActions","status:"+e)}})}),this.options.editMode)this.selectSurvey(this.model.get("survey")._id),this.$id("problem").focus();else if(this.model.surveys.length){this.selectSurvey(this.model.surveys.at(0).id);var e=s.getDivision();e&&this.selectDivision(e.id),this.$id(1===this.model.surveys.length?"division":"survey").focus()}else this.setUpDivisionSelect2([]),this.setUpOwnersSelect2([]),this.setUpQuestionSelect2([]),this.$id("survey").focus()},setUpDivisionSelect2:function(e){this.$id("division").select2({minimumResultsForSearch:2,data:e.map(function(e){var t=a.divisions.get(e);return{id:t.id,text:t.get("full")+" ("+t.get("short")+")"}})})},setUpOwnersSelect2:function(e){this.$id("owners").select2({minimumResultsForSearch:7,multiple:!0,data:e.map(function(e){return{id:e._id,text:e.full+" ("+e.division+")",division:e.division}})})},setUpQuestionSelect2:function(e){this.$id("questionList").select2({minimumResultsForSearch:-1,formatResult:u,data:e.map(function(e){return{id:e._id,text:e["short"],"short":e["short"],full:e.full}})})},selectSurvey:function(e){var t=this.model.surveys.get(e);t&&(this.setUpDivisionSelect2(Object.keys(t.cacheMaps.divisions)),this.setUpOwnersSelect2(t.get("superiors")),this.setUpQuestionSelect2(t.get("questions")),this.$id("survey").select2("val",t.id))},selectDivision:function(e){var t=this.model.surveys.get(this.$id("survey").val()),i=t.cacheMaps.divisions[e].map(function(e){return e._id});this.$id("owners").select2("val",i);var s=this,n=this.ajax({url:"/users?select(firstName,lastName)&prodFunction=manager&orgUnitId="+e});n.done(function(t){if(t&&t.totalCount){var i=t.collection[0];s.$id("superior").select2("data",{id:i._id,text:i.lastName+" "+i.firstName+" ("+e+")"})}}),this.$id("division").select2("val",e)}})});