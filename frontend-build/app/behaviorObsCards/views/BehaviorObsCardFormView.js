define(["underscore","form2js","app/i18n","app/time","app/user","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/views/FormView","app/users/util/setUpUserSelect2","app/data/prodLines","app/data/companies","app/kaizenOrders/dictionaries","../BehaviorObsCard","app/behaviorObsCards/templates/form","app/behaviorObsCards/templates/_formObservation","app/behaviorObsCards/templates/_formRisk","app/behaviorObsCards/templates/_formDifficulty","app/behaviorObsCards/templates/_formRidEditor"],function(e,t,i,s,r,a,n,o,l,d,u,c,f,p,h,m,v,b){"use strict";return o.extend({template:p,events:e.assign({"click .behaviorObsCards-form-radio":function(e){"TD"===e.target.tagName&&e.target.querySelector('input[type="radio"]').click()},'mousedown input[type="radio"]':function(e){e.preventDefault()},'mouseup input[type="radio"]':function(e){e.preventDefault()},'click input[type="radio"]':function(e){var t=this,i=e.target,s=t.$(i).closest("tr"),r=s.find('input[name="'+i.name+'"][value="-1"]');r.length?(e.preventDefault(),setTimeout(function(){i.checked=!i.checked,i.checked||r.prop("checked",!0),i.name.indexOf("safe")>=0&&t.toggleBehavior(s),t.toggleValidity(s)},1)):t.toggleValidity(s)},"change textarea":function(e){this.toggleValidity(this.$(e.target).closest("tr"))},"click #-addObservation":function(){this.$id("observations").append(h({observation:{id:"OTHER-"+Date.now(),behavior:c.getLabel("behaviours","OTHER"),observation:"",safe:null,easy:null},i:++this.rowIndex}))},"click #-addRisk":function(){this.$id("risks").append(m({risk:this.createEmptyRisk(),i:++this.rowIndex}))},"click #-addDifficulty":function(){this.$id("difficulties").append(v({difficulty:this.createEmptyDifficulty(),i:++this.rowIndex}))},"click #-removeRisk":function(){this.removeEmpty("risks","addRisk","risk")},"click #-removeDifficulty":function(){this.removeEmpty("difficulties","addDifficulty","problem")},"click .behaviorObsCards-form-rid-message > a":function(){localStorage.setItem("BOC_LAST",JSON.stringify(e.assign(this.model.toJSON(),this.getFormData())))},"click a[role=rid]":function(e){return this.showRidEditor(e.currentTarget.dataset.kind,e.currentTarget),!1},"change #-company":function(){this.toggleCompanyName("")}},o.prototype.events),initialize:function(){o.prototype.initialize.apply(this,arguments),this.rowIndex=0},removeEmpty:function(e,t,i){for(var s=this.$id(e).find("tr"),r=s.length-1;r>=0;--r){var a=this.$(s[r]),n=a.find("textarea"),o=a.find('input[type="radio"]:checked');""!==n[0].value.trim()||""!==n[1].value.trim()||o.length&&"-1"!==o.val()||a.remove()}0===this.$id(e).children().length&&this.$id(t).click(),this.$id(e).find('textarea[name$="'+i+'"]').first().select()},toggleValidity:function(e){var t=e?e.parent().attr("id"):"";if(/risks/.test(t)){var i=e.find('textarea[name$="risk"]'),s=e.find('textarea[name$="cause"]'),r=e.find('input[name$="easy"]'),a=i.val().trim().length>0,n=s.val().trim().length>0,o=r.filter(":checked").val()||"-1";i.prop("required","-1"!==o||n),r.prop("required",a);var l=r.filter('[value="-1"]').prop("disabled",a||n);(a||n)&&l.prop("checked",!1)}else if(/difficulties/.test(t)){var d=e.find('textarea[name$="problem"]'),u=e.find('textarea[name$="solution"]'),c=e.find('input[name$="behavior"]'),f=d.val().trim().length>0,p=u.val().trim().length>0,h=c.filter(":checked").val();d.prop("required","-1"!==h||p),c.prop("required",f);var m=c.filter('[value="-1"]').prop("disabled",f||p);(f||p)&&m.prop("checked",!1)}this.toggleEasyDiscussed(),this.toggleDifficulties(),this.$('input[name="observations[1].safe"]')[0].setCustomValidity(this.hasAnyObservation()||this.hasAnyRisk()?"":this.t("FORM:ERROR:empty"))},toggleDifficulties:function(){if(!this.hasAnyDifficulty()){var e=this.$id("observations").find('input[name$="easy"][value="0"]:checked').length||this.$id("risks").find('input[name$="easy"][value="0"]:checked').length;this.$id("difficulties").find("textarea").first().prop("required",e)}},toggleBehavior:function(e){var t=e.find('input[name$="safe"]:checked').val();e.find('textarea, input[name$="easy"]').prop("disabled","0"!==t),e.find("textarea").first().select(),"0"!==t&&e.find('input[name$="easy"]:checked').prop("checked",!1)},toggleEasyDiscussed:function(){var e=this.$('input[name$="easy"][value="1"]:checked').length>0;this.$('input[name="easyDiscussed"]').prop("disabled",!e).closest("label").toggleClass("is-required",e)},toggleCompanyName:function(e){var t=this.$id("company").val(),i=u.get(t),s=/(pozostali|other)/i.test(t);this.$id("companyName").prop("readonly",!s).prop("required",s).val(s?e:i?i.getLabel():"").closest(".form-group").find(".control-label").toggleClass("is-required",s)},hasAnyObservation:function(){return e.some(t(this.$id("observations")[0]).observations,this.filterObservation)},hasAnyRisk:function(){return e.some(t(this.$id("risks")[0]).risks,this.filterRisk)},hasAnyDifficulty:function(){return e.some(t(this.$id("difficulties")[0]).difficulties,this.filterDifficulty)},checkValidity:function(e){return(e.observations||[]).length||(e.risks||[]).length},handleInvalidity:function(){this.$id("observations").find('input[type="radio"]').first().focus()},serializeToForm:function(){var e=this.model.toJSON();return e.date=s.format(e.date,"YYYY-MM-DD"),e},serializeForm:function(e){var t=this.$id("observer").select2("data"),i=this.$id("superior").select2("data"),r=s.getMoment(e.date,"YYYY-MM-DD");e.observer={id:t.id,label:t.text},e.superior=i?{id:i.id,label:i.text}:null,e.date=r.isValid()?r.toISOString():null,e.easyDiscussed=!!e.easyDiscussed,e.observations=(e.observations||[]).filter(this.filterObservation),e.risks=(e.risks||[]).filter(this.filterRisk),e.difficulties=(e.difficulties||[]).filter(this.filterDifficulty);var a=null;return e.observations=e.observations.filter(function(e){return!/^OTHER/.test(e.id)||!e.safe||(a=e,!1)}),a&&e.observations.push(a),e},filterObservation:function(e){return e.id=e.behavior,e.behavior=c.getLabel("behaviours",/^OTHER-/.test(e.id)?"OTHER":e.id),e.observation=(e.observation||"").trim(),e.cause=(e.cause||"").trim(),e.safe="-1"===e.safe?null:"1"===e.safe,e.easy="-1"===e.easy?null:"1"===e.easy,null!==e.safe&&null!==e.easy},filterRisk:function(e){return e.risk=(e.risk||"").trim(),e.cause=(e.cause||"").trim(),e.easy="-1"===e.easy?null:"1"===e.easy,(e.risk.length>0||e.cause.length>0)&&null!==e.easy},filterDifficulty:function(e){return e.problem=(e.problem||"").trim(),e.solution=(e.solution||"").trim(),e.behavior="-1"===e.behavior?null:"1"===e.behavior,e.problem.length>0||e.solution.length>0||null!==e.behavior},afterRender:function(){o.prototype.afterRender.call(this),this.$id("observerSection").select2({data:c.sections.map(n)}),this.$id("section").select2({data:c.sections.map(n)}),this.$id("line").select2({data:d.filter(function(e){return!e.get("deactivatedAt")}).map(n).sort(function(e,t){return e.text.localeCompare(t.text)})}),this.$id("company").select2({data:u.map(n)}),a.toggle(this.$id("shift")),this.setUpObserverSelect2(),this.setUpSuperiorSelect2(),this.renderObservations(),this.renderRisks(),this.renderDifficulties(),this.toggleEasyDiscussed(),this.toggleCompanyName(this.model.get("companyName")),this.toggleValidity(),this.$("input[autofocus]").focus()},setUpObserverSelect2:function(){var e=this.model.get("observer"),t=l(this.$id("observer"),{textFormatter:function(e,t){return t},activeOnly:!this.options.editMode});e&&t.select2("data",{id:e.id,text:e.label})},setUpSuperiorSelect2:function(){var e=this.model.get("superior"),t=l(this.$id("superior"),{textFormatter:function(e,t){return t},activeOnly:!this.options.editMode});e&&t.select2("data",{id:e.id,text:e.label})},setUpAddObservationSelect2:function(){var e={};this.$id("observations").find('input[name$="behavior"]').each(function(){e[this.value]=1}),this.$id("addObservation").select2({width:"500px",placeholder:"Wybierz kategorię zachowań, aby dodać nową obserwację...",minimumResultsForSearch:7,data:c.behaviours.filter(function(t){return!e[t.id]}).map(n)})},renderObservations:function(){var e=this;this.$id("observations").html(this.serializeObservationsToForm().map(function(t){return h({observation:t,i:++e.rowIndex})}).join(""))},serializeObservationsToForm:function(){var t={},i=[];return(this.model.get("observations")||[]).forEach(function(e){t[e.id]=e}),c.behaviours.forEach(function(e){var s=t[e.id];s?(s.behavior=e.t("name"),i.push(s),delete t[e.id]):i.push({id:e.id,behavior:e.t("name"),observation:"",safe:null,easy:null})}),e.forEach(t,function(e){i.push(e)}),i},renderRisks:function(){for(var e=this,t=this.model.get("risks")||[];t.length<2;)t.push(this.createEmptyRisk());t.push(this.createEmptyRisk()),this.$id("risks").html(t.map(function(t){return m({risk:t,i:++e.rowIndex})}).join(""))},renderDifficulties:function(){for(var e=this,t=this.model.get("difficulties")||[];t.length<2;)t.push(this.createEmptyDifficulty());t.push(this.createEmptyDifficulty()),this.$id("difficulties").html(t.map(function(t){return v({difficulty:t,i:++e.rowIndex})}).join(""))},createEmptyRisk:function(){return{risk:"",cause:"",easy:null}},createEmptyDifficulty:function(){return{problem:"",solution:"",behavior:null}},handleSuccess:function(){localStorage.removeItem("BOC_LAST"),this.broker.publish("router.navigate",{url:this.model.genClientUrl()+"?"+(this.options.editMode?"":"&thank=you")+(this.options.standalone?"&standalone=1":""),trigger:!0})},showRidEditor:function(e,t){var s=this,r=s.$(t);if(r.next(".popover").length)r.popover("destroy");else{r.popover({placement:"auto top",html:!0,trigger:"manual",content:b({idPrefix:this.idPrefix,helpers:this.getTemplateHelpers(),property:e,rid:this.model.get(e)||""})}).popover("show");var a=r.next(".popover"),n=a.find(".form-control").select(),o=a.find(".btn-default"),l=a.find(".btn-link");l.on("click",function(){r.popover("destroy")}),n.on("keydown",function(e){if(13===e.keyCode)return!1}),n.on("keyup",function(e){if(13===e.keyCode)return o.click(),!1}),o.on("click",function(){n.prop("disabled",!0),o.prop("disabled",!0),l.prop("disabled",!0);var t=parseInt(n.val(),10)||0;if(t<=0)return d(null);var r=("nearMiss"===e?"/kaizen/orders":"/suggestions")+"/"+t,a=s.ajax({url:r});return a.fail(function(e){s.showErrorMessage(i("behaviorObsCards","FORM:ridEditor:"+(404===e.status?"notFound":"failure"))),n.prop("disabled",!1),o.prop("disabled",!1),l.prop("disabled",!1),(404===e.status?n:o).focus()}),a.done(function(){d(t)}),!1})}function d(t){r.popover("destroy").closest(".message").find(".behaviorObsCards-form-rid-message").html(s.t("FORM:MSG:"+e+":"+(t?"edit":"add"),{rid:t})),s.model.attributes[e]=t,s.$("input[name="+e+"]").val(t||"")}}})});