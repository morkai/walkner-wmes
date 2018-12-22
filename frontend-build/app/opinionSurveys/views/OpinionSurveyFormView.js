define(["underscore","jquery","form2js","js2form","app/i18n","app/time","app/user","app/viewport","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/views/FormView","app/data/orgUnits","app/users/util/setUpUserSelect2","../dictionaries","../OpinionSurvey","../util/formatQuestionResult","app/opinionSurveys/templates/form","app/opinionSurveys/templates/formEmployerTr","app/opinionSurveys/templates/formSuperiorTr","app/opinionSurveys/templates/formQuestionTr"],function(e,i,t,s,n,r,o,a,l,u,p,d,c,h,f,m,v,y,g,b){"use strict";function S(e){return JSON.parse(JSON.stringify(e))}return p.extend({template:v,employerCounter:0,superiorCounter:0,questionCounter:0,events:e.extend({"click .opinionSurveys-form-deleteRow":function(e){var t=this.$(e.currentTarget).closest("tr"),s=t.closest("table");t.fadeOut("fast",function(){i(this).remove(),s.find("tbody").children().length||s.css("display","none")}),s.hasClass("opinionSurveys-form-employersTable")&&this.setUpEmployersSelect2(!0),s.hasClass("opinionSurveys-form-questionsTable")&&this.setUpQuestionsSelect2(!0)},"click .opinionSurveys-form-moveRowUp":function(e){var i=this.$(e.currentTarget),t=i.closest("tr"),s=t.prev();if(s.length)t.insertBefore(s);else{var n=t.parent().children();n.length>1&&t.insertAfter(n.last())}i.focus()},"click .opinionSurveys-form-moveRowDown":function(e){var i=this.$(e.currentTarget),t=i.closest("tr"),s=t.next();if(s.length)t.insertAfter(s);else{var n=t.parent().children();n.length>1&&t.insertBefore(n.first())}i.focus()},"click #-preview":function(){if(this.el.checkValidity()){var e=this.$id("preview").prop("disabled",!0),i=this.$id("lang").find("input").first().val(),s=this.$('input[name="langSwitch"]:checked').val();s!==i&&this.enableLang();var r=this.serializeForm(t(this.el));s!==i&&this.disableLang();var o=this.ajax({method:"POST",url:"/opinionSurveys/preview?lang="+s,data:JSON.stringify(r)});o.fail(function(){a.msg.show({type:"error",time:3e3,text:n("opinionSurveys","FORM:ERROR:previewFailure")})}),o.done(this.openPreviewWindow.bind(this)),o.always(function(){e.prop("disabled",!1)})}else this.$id("submit").click()},'change input[name="langSwitch"]':function(){var i=this.$id("lang").find("input").first().val(),t=this.$('input[name="langSwitch"]:checked').val();if(this.selectedLang||(this.selectedLang=t),t!==this.selectedLang){var n,r=["company","intro","employer","superior","employers","superiors","questions"],o=e.pick(this.getFormData(),r),a=this.model.attributes;t===i?(n=e.pick(a,r),this.enableLang()):(a.lang||(a.lang={}),a.lang[t]||(a.lang[t]=S(e.pick(a,r))),n=a.lang[t],this.disableLang()),this.selectedLang===i?e.assign(a,o):this.copyLang(a,a.lang[this.selectedLang],o),s(this.el,n,".",null,!1,!1),this.selectedLang=t}}},p.prototype.events,{submit:function(){return this.sortSuperiors=!0,this.$id("lang").find("input").first().parent().click(),this.submitForm(),this.sortSuperiors=!1,!1}}),enableLang:function(){this.$id("employers").select2("enable"),this.$id("superiors").select2("enable"),this.$id("questions").select2("enable"),this.$('input[name$="division"]').select2("enable"),this.$('input[name$="short"]').prop("disabled",!1),this.$(".actions .btn").prop("disabled",!1)},disableLang:function(){this.$id("employers").select2("disable"),this.$id("superiors").select2("disable"),this.$id("questions").select2("disable"),this.$('input[name$="division"]').select2("disable"),this.$('input[name$="short"]').prop("disabled",!0),this.$(".actions .btn").prop("disabled",!0)},copyLang:function(e,i,t){var s={},n={},r={};t.employers.forEach(function(e){s[e._id]=e}),t.superiors.forEach(function(e){n[e._id]=e}),t.questions.forEach(function(e){r[e._id]=e}),i.company=t.company||"",i.intro=t.intro||"",i.employer=t.employer||"",i.superior=t.superior||"",i.employers=[],i.superiors=[],i.questions=[],e.employers.forEach(function(e){i.employers.push(s[e._id]||S(e))}),e.superiors.forEach(function(e){i.superiors.push(n[e._id]||S(e))}),e.questions.forEach(function(e){i.questions.push(r[e._id]||S(e))})},initialize:function(){p.prototype.initialize.apply(this,arguments),this.sortSuperiors=!1},serializeToForm:function(){var e=this.model.toJSON();return e.startDate&&(e.startDate=r.format(e.startDate,"YYYY-MM-DD")),e.endDate&&(e.endDate=r.format(e.endDate,"YYYY-MM-DD")),e},serializeForm:function(e){return e.employers||(e.employers=[]),e.superiors||(e.superiors=[]),this.sortSuperiors&&e.superiors.sort(function(e,i){if(e.division===i.division)return e.full.localeCompare(i.full);var t=e.division.match(/([a-z])$/),s=i.division.match(/([a-z])$/);return t&&!s?-1:!t&&s?1:t||s?t[1].localeCompare(s[1]):e.division.localeCompare(i.division)}),e.questions||(e.questions=[]),e},afterRender:function(){p.prototype.afterRender.call(this),this.renderEmployersTable(),this.renderSuperiorsTable(),this.renderQuestionsTable(),this.setUpEmployersSelect2(),this.setUpSuperiorsSelect2(),this.setUpQuestionsSelect2(),this.$id("lang").find("input").first().parent().click(),this.$("input[autofocus]").focus()},setUpEmployersSelect2:function(e){var t=this.$id("employersTable"),s=t.find("tbody"),n=o(this.$id("employers"),s);if(!e){var r=this;s.children().length||t.css("display","none"),n.on("change",function(e){if(n.select2("data",null),e.added){var a=e.added.employer;i(y({i:++r.employerCounter,employer:{_id:a.id,short:a.get("short"),full:a.get("full")}})).appendTo(s),t.css("display",""),n.focus(),o(n,s)}})}function o(e,i){var t=i.find('input[name$="_id"]').map(function(){return this.value}).get();return e.select2({minimumResultsForSearch:-1,data:h.employers.map(function(e){return{id:e.id,text:e.get("short"),employer:e}}).filter(function(e){return-1===t.indexOf(e.id)})})}},setUpSuperiorsSelect2:function(){var e=this.$id("superiorsTable"),t=e.find("tbody"),s=c(this.$id("superiors")),n=this;t.children().length||e.css("display","none"),s.on("change",function(r){if(s.select2("data",null),r.added){var o=r.added.user;if(!t.find('[value="'+o._id+'"]').length){var a="";"division"===o.orgUnitType?a=o.orgUnitId:"subdivision"===o.orgUnitType&&(a=d.getByTypeAndId("subdivision",o.orgUnitId).get("division"));var l=h.divisions.get(a);l||(l=h.divisions.at(0));var u=i(g({i:++n.superiorCounter,superior:{_id:o._id,full:o.lastName+" "+o.firstName,short:o.lastName+" "+o.firstName.substring(0,1)+".",division:l?l.id:""}}));t.append(u),e.css("display",""),n.setUpSuperiorsDivisionSelect2(u),s.focus()}}})},setUpSuperiorsDivisionSelect2:function(e){e.find('[name$="division"]').select2({minimumResultsForSearch:-1,data:h.divisions.map(function(e){return{id:e.id,text:e.get("full")+" ("+e.get("short")+")"}})})},setUpQuestionsSelect2:function(e){var t=this.$id("questionsTable"),s=t.find("tbody"),n=o(this.$id("questions"),s);if(!e){var r=this;s.children().length||t.css("display","none"),n.on("change",function(e){if(n.select2("data",null),e.added){var a=e.added.question;i(b({i:++r.questionCounter,question:{_id:a.id,short:a.get("short"),full:a.get("full")}})).appendTo(s),t.css("display",""),n.focus(),o(n,s)}})}function o(e,i){var t=i.find('input[name$="_id"]').map(function(){return this.value}).get();return e.select2({formatResult:m,minimumResultsForSearch:-1,data:h.questions.map(function(e){return{id:e.id,text:e.get("short"),question:e}}).filter(function(e){return-1===t.indexOf(e.id)})})}},renderEmployersTable:function(){var e=this,t=this.$id("employersTable").find("tbody").empty();(this.model.get("employers")||[]).forEach(function(s){var n=i(y({i:++e.employerCounter,employer:s}));t.append(n)})},renderSuperiorsTable:function(){var e=this,t=this.$id("superiorsTable").find("tbody").empty();(this.model.get("superiors")||[]).forEach(function(s){var n=i(g({i:++e.superiorCounter,superior:s}));t.append(n),e.setUpSuperiorsDivisionSelect2(n)})},renderQuestionsTable:function(){var e=this,t=this.$id("questionsTable").find("tbody").empty();(this.model.get("questions")||[]).forEach(function(s){var n=i(b({i:++e.questionCounter,question:s}));t.append(n)})},openPreviewWindow:function(e){var i="/opinionSurveys/"+e+".pdf?recreate=1",t=window.screen,s=.6*t.availWidth,r=.8*t.availHeight,o=Math.floor((t.availWidth-s)/2),l="resizable,scrollbars,location=no,top="+Math.floor((t.availHeight-r)/2)+",left="+o+",width="+Math.floor(s)+",height="+Math.floor(r);window.open(i,"OPINION_SURVEY_PREVIEW",l)||a.msg.show({type:"warning",time:3e3,text:n("opinionSurveys","FORM:ERROR:previewPopupBlocked")})}})});