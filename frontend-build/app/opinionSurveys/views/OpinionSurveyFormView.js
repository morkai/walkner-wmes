// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","form2js","app/i18n","app/time","app/user","app/viewport","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/views/FormView","app/data/orgUnits","app/users/util/setUpUserSelect2","../dictionaries","../OpinionSurvey","../util/formatQuestionResult","app/opinionSurveys/templates/form","app/opinionSurveys/templates/formSuperiorTr","app/opinionSurveys/templates/formQuestionTr"],function(e,i,t,s,r,o,n,a,u,l,p,d,c,f,h,v,m,y){"use strict";return l.extend({template:v,superiorCounter:0,questionCounter:0,events:e.extend({"click .opinionSurveys-form-deleteRow":function(e){var t=this.$(e.currentTarget).closest("tr"),s=t.closest("table");t.fadeOut("fast",function(){i(this).remove(),s.find("tbody").children().length||s.css("display","none")}),s.hasClass("opinionSurveys-form-questionsTable")&&this.setUpQuestionsSelect2(!0)},"click .opinionSurveys-form-moveRowUp":function(e){var i=this.$(e.currentTarget),t=i.closest("tr"),s=t.prev();if(s.length)t.insertBefore(s);else{var r=t.parent().children();r.length>1&&t.insertAfter(r.last())}i.focus()},"click .opinionSurveys-form-moveRowDown":function(e){var i=this.$(e.currentTarget),t=i.closest("tr"),s=t.next();if(s.length)t.insertAfter(s);else{var r=t.parent().children();r.length>1&&t.insertBefore(r.first())}i.focus()},"click #-preview":function(){if(!this.el.checkValidity())return void this.$id("submit").click();var e=this.$id("preview").prop("disabled",!0),i=this.serializeForm(t(this.el)),r=this.ajax({method:"POST",url:"/opinionSurveys/preview",data:JSON.stringify(i)});r.fail(function(){n.msg.show({type:"error",time:3e3,text:s("opinionSurveys","FORM:ERROR:previewFailure")})}),r.done(this.openPreviewWindow.bind(this)),r.always(function(){e.prop("disabled",!1)})}},l.prototype.events),serializeToForm:function(){var e=this.model.toJSON();return e.startDate&&(e.startDate=r.format(e.startDate,"YYYY-MM-DD")),e.endDate&&(e.endDate=r.format(e.endDate,"YYYY-MM-DD")),e.employers=(e.employers||[]).map(function(e){return e._id}).join(","),e},serializeForm:function(e){return e.employers=this.$id("employers").select2("data").map(function(e){return c.employers.get(e.id).toJSON()}),e.superiors||(e.superiors=[]),e.superiors.sort(function(e,i){if(e.division===i.division)return e.full.localeCompare(i.full);var t=e.division.match(/([a-z])$/),s=i.division.match(/([a-z])$/);return t&&!s?-1:!t&&s?1:t||s?t[1].localeCompare(s[1]):e.division.localeCompare(i.division)}),e},afterRender:function(){l.prototype.afterRender.call(this),this.renderSuperiorsTable(),this.renderQuestionsTable(),this.setUpEmployersSelect2(),this.setUpSuperiorsSelect2(),this.setUpQuestionsSelect2(),this.$("input[autofocus]").focus()},setUpEmployersSelect2:function(){this.$id("employers").select2({multiple:!0,data:c.employers.map(u)})},setUpSuperiorsSelect2:function(){var e=this.$id("superiorsTable"),t=e.find("tbody"),s=d(this.$id("superiors")),r=this;t.children().length||e.css("display","none"),s.on("change",function(o){if(s.select2("data",null),o.added){var n=o.added.user;if(!t.find('[value="'+n._id+'"]').length){var a="";"division"===n.orgUnitType?a=n.orgUnitId:"subdivision"===n.orgUnitType&&(a=p.getByTypeAndId("subdivision",n.orgUnitId).get("division"));var u=c.divisions.get(a);u||(u=c.divisions.at(0));var l=i(m({i:++r.superiorCounter,superior:{_id:n._id,full:n.lastName+" "+n.firstName,short:n.lastName+" "+n.firstName.substring(0,1)+".",division:u?u.id:""}}));t.append(l),e.css("display",""),r.setUpSuperiorsDivisionSelect2(l),l.find('[name$="short"]').select()}}})},setUpSuperiorsDivisionSelect2:function(e){e.find('[name$="division"]').select2({minimumResultsForSearch:-1,data:c.divisions.map(function(e){return{id:e.id,text:e.get("full")+" ("+e.get("short")+")"}})})},setUpQuestionsSelect2:function(e){function t(e,i){var t=i.find('input[name$="_id"]').map(function(){return this.value}).get();return e.select2({formatResult:h,minimumResultsForSearch:-1,data:c.questions.map(function(e){return{id:e.id,text:e.get("short"),question:e}}).filter(function(e){return t.indexOf(e.id)===-1})})}var s=this.$id("questionsTable"),r=s.find("tbody"),o=t(this.$id("questions"),r);if(!e){var n=this;r.children().length||s.css("display","none"),o.on("change",function(e){if(o.select2("data",null),e.added){var a=e.added.question,u=i(y({i:++n.questionCounter,question:{_id:a.id,short:a.get("short"),full:a.get("full")}}));u.appendTo(r),s.css("display",""),u.find('[name$="short"]').select(),t(o,r)}})}},renderSuperiorsTable:function(){var e=this,t=this.$id("superiorsTable").find("tbody");(this.model.get("superiors")||[]).forEach(function(s){var r=i(m({i:++e.superiorCounter,superior:s}));t.append(r),e.setUpSuperiorsDivisionSelect2(r)})},renderQuestionsTable:function(){var e=this,t=this.$id("questionsTable").find("tbody");(this.model.get("questions")||[]).forEach(function(s){var r=i(y({i:++e.questionCounter,question:s}));t.append(r)})},openPreviewWindow:function(e){var i="/opinionSurveys/"+e+".pdf?recreate=1",t="OPINION_SURVEY_PREVIEW",r=window.screen,o=.6*r.availWidth,a=.8*r.availHeight,u=Math.floor((r.availWidth-o)/2),l=Math.floor((r.availHeight-a)/2),p="resizable,scrollbars,location=no,top="+l+",left="+u+",width="+Math.floor(o)+",height="+Math.floor(a),d=window.open(i,t,p);d||n.msg.show({type:"warning",time:3e3,text:s("opinionSurveys","FORM:ERROR:previewPopupBlocked")})}})});