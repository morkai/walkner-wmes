// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","form2js","app/i18n","app/time","app/user","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/views/FormView","app/users/util/setUpUserSelect2","app/data/prodLines","app/kaizenOrders/dictionaries","../BehaviorObsCard","app/behaviorObsCards/templates/form","app/behaviorObsCards/templates/_formObservation","app/behaviorObsCards/templates/_formRisk","app/behaviorObsCards/templates/_formDifficulty","app/behaviorObsCards/templates/_formRidEditor"],function(e,i,t,r,s,a,n,o,l,d,u,c,f,p,h,v,m,b){"use strict";return l.extend({template:p,events:e.extend({"click .behaviorObsCards-form-radio":function(e){"TD"===e.target.tagName&&e.target.querySelector('input[type="radio"]').click()},'mousedown input[type="radio"]':function(e){e.preventDefault()},'mouseup input[type="radio"]':function(e){e.preventDefault()},'click input[type="radio"]':function(e){var i=this,t=e.target,r=i.$(t),s=r.closest("tr"),a=s.find('input[name="'+t.name+'"][value="-1"]');if(!a.length)return void i.toggleValidity(s);e.preventDefault(),setTimeout(function(){t.checked=!t.checked,t.checked||a.prop("checked",!0),t.name.indexOf("safe")>=0&&i.toggleBehavior(s),i.toggleValidity(s)},1)},"change textarea":function(e){this.toggleValidity(this.$(e.target).closest("tr"))},"click #-addObservation":function(){this.$id("observations").append(h({observation:{id:"OTHER-"+Date.now(),behavior:c.getLabel("behaviours","OTHER"),observation:"",safe:null,easy:null},i:++this.rowIndex}))},"click #-addRisk":function(){this.$id("risks").append(v({risk:this.createEmptyRisk(),i:++this.rowIndex}))},"click #-addDifficulty":function(){this.$id("difficulties").append(m({difficulty:this.createEmptyDifficulty(),i:++this.rowIndex}))},"click #-removeRisk":function(){this.removeEmpty("risks","addRisk","risk")},"click #-removeDifficulty":function(){this.removeEmpty("difficulties","addDifficulty","problem")},"click .behaviorObsCards-form-rid-message > a":function(){localStorage.setItem("BOC_LAST",JSON.stringify(e.assign(this.model.toJSON(),this.getFormData())))},"click a[role=rid]":function(e){return this.showRidEditor(e.currentTarget.dataset.kind,e.currentTarget),!1}},l.prototype.events),initialize:function(){l.prototype.initialize.apply(this,arguments),this.rowIndex=0},serialize:function(){return e.extend(l.prototype.serialize.call(this),{})},removeEmpty:function(e,i,t){for(var r=this.$id(e).find("tr"),s=r.length-1;s>=0;--s){var a=this.$(r[s]),n=a.find("textarea"),o=a.find('input[type="radio"]:checked');""!==n[0].value.trim()||""!==n[1].value.trim()||o.length&&"-1"!==o.val()||a.remove()}0===this.$id(e).children().length&&this.$id(i).click(),this.$id(e).find('textarea[name$="'+t+'"]').first().select()},toggleValidity:function(e){var i=e?e.parent().attr("id"):"";if(/risks/.test(i)){var t=e.find('textarea[name$="risk"]'),r=e.find('textarea[name$="cause"]'),s=e.find('input[name$="easy"]'),a=t.val().trim().length>0,n=r.val().trim().length>0,o=s.filter(":checked").val()||"-1";t.prop("required","-1"!==o||n),s.prop("required",a);var l=s.filter('[value="-1"]').prop("disabled",a||n);(a||n)&&l.prop("checked",!1)}else if(/difficulties/.test(i)){var d=e.find('textarea[name$="problem"]'),u=e.find('textarea[name$="solution"]'),c=e.find('input[name$="behavior"]'),f=d.val().trim().length>0,p=u.val().trim().length>0,h=c.filter(":checked").val();d.prop("required","-1"!==h||p),c.prop("required",f);var v=c.filter('[value="-1"]').prop("disabled",f||p);(f||p)&&v.prop("checked",!1)}this.toggleEasyDiscussed(),this.toggleDifficulties(),this.$('input[name="observations[1].safe"]')[0].setCustomValidity(this.hasAnyObservation()||this.hasAnyRisk()?"":this.t("FORM:ERROR:empty"))},toggleDifficulties:function(){if(!this.hasAnyDifficulty()){var e=this.$id("observations").find('input[name$="easy"][value="0"]:checked').length||this.$id("risks").find('input[name$="easy"][value="0"]:checked').length;this.$id("difficulties").find("textarea").first().prop("required",e)}},toggleBehavior:function(e){var i=e.find('input[name$="safe"]:checked').val();e.find('textarea, input[name$="easy"]').prop("disabled","0"!==i),e.find("textarea").first().select(),"0"!==i&&e.find('input[name$="easy"]:checked').prop("checked",!1)},toggleEasyDiscussed:function(){var e=this.$('input[name$="easy"][value="1"]:checked').length>0;this.$('input[name="easyDiscussed"]').prop("disabled",!e).closest("label").toggleClass("is-required",e)},hasAnyObservation:function(){return e.some(t(this.$id("observations")[0]).observations,this.filterObservation)},hasAnyRisk:function(){return e.some(t(this.$id("risks")[0]).risks,this.filterRisk)},hasAnyDifficulty:function(){return e.some(t(this.$id("difficulties")[0]).difficulties,this.filterDifficulty)},checkValidity:function(e){return(e.observations||[]).length||(e.risks||[]).length},handleInvalidity:function(){this.$id("observations").find('input[type="radio"]').first().focus()},serializeToForm:function(){var e=this.model.toJSON();return e.date=s.format(e.date,"YYYY-MM-DD"),e},serializeForm:function(e){var i=this.$id("observer").select2("data"),t=this.$id("superior").select2("data"),r=s.getMoment(e.date,"YYYY-MM-DD");e.observer={id:i.id,label:i.text},e.superior=t?{id:t.id,label:t.text}:null,e.date=r.isValid()?r.toISOString():null,e.easyDiscussed=!!e.easyDiscussed,e.observations=(e.observations||[]).filter(this.filterObservation),e.risks=(e.risks||[]).filter(this.filterRisk),e.difficulties=(e.difficulties||[]).filter(this.filterDifficulty);var a=null;return e.observations=e.observations.filter(function(e){return!/^OTHER/.test(e.id)||!e.safe||(a=e,!1)}),a&&e.observations.push(a),e},filterObservation:function(e){return e.id=e.behavior,e.behavior=c.getLabel("behaviours",/^OTHER-/.test(e.id)?"OTHER":e.id),e.observation=(e.observation||"").trim(),e.cause=(e.cause||"").trim(),e.safe="-1"===e.safe?null:"1"===e.safe,e.easy="-1"===e.easy?null:"1"===e.easy,null!==e.safe&&null!==e.easy},filterRisk:function(e){return e.risk=(e.risk||"").trim(),e.cause=(e.cause||"").trim(),e.easy="-1"===e.easy?null:"1"===e.easy,(e.risk.length>0||e.cause.length>0)&&null!==e.easy},filterDifficulty:function(e){return e.problem=(e.problem||"").trim(),e.solution=(e.solution||"").trim(),e.behavior="-1"===e.behavior?null:"1"===e.behavior,e.problem.length>0||e.solution.length>0||null!==e.behavior},afterRender:function(){l.prototype.afterRender.call(this),this.$id("observerSection").select2({data:c.sections.map(o)}),this.$id("section").select2({data:c.sections.map(o)}),this.$id("line").select2({data:u.filter(function(e){return!e.get("deactivatedAt")}).map(o).sort(function(e,i){return e.text.localeCompare(i.text)})}),this.setUpObserverSelect2(),this.setUpSuperiorSelect2(),this.renderObservations(),this.renderRisks(),this.renderDifficulties(),this.toggleEasyDiscussed(),this.toggleValidity(),this.$("input[autofocus]").focus()},setUpObserverSelect2:function(){var e=this.model.get("observer"),i=d(this.$id("observer"),{textFormatter:function(e,i){return i}});e&&i.select2("data",{id:e.id,text:e.label})},setUpSuperiorSelect2:function(){var e=this.model.get("superior"),i=d(this.$id("superior"),{textFormatter:function(e,i){return i}});e&&i.select2("data",{id:e.id,text:e.label})},setUpAddObservationSelect2:function(){var e={};this.$id("observations").find('input[name$="behavior"]').each(function(){e[this.value]=1}),this.$id("addObservation").select2({width:"500px",placeholder:"Wybierz kategorię zachowań, aby dodać nową obserwację...",minimumResultsForSearch:7,data:c.behaviours.filter(function(i){return!e[i.id]}).map(o)})},renderObservations:function(){var e=this;this.$id("observations").html(this.serializeObservationsToForm().map(function(i){return h({observation:i,i:++e.rowIndex})}).join(""))},serializeObservationsToForm:function(){var i={},t=[];return(this.model.get("observations")||[]).forEach(function(e){i[e.id]=e}),c.behaviours.forEach(function(e){var r=i[e.id];r?(r.behavior=e.get("name"),t.push(r),delete i[e.id]):t.push({id:e.id,behavior:e.get("name"),observation:"",safe:null,easy:null})}),e.forEach(i,function(e){t.push(e)}),t},renderRisks:function(){for(var e=this,i=this.model.get("risks")||[];i.length<2;)i.push(this.createEmptyRisk());i.push(this.createEmptyRisk()),this.$id("risks").html(i.map(function(i){return v({risk:i,i:++e.rowIndex})}).join(""))},renderDifficulties:function(){for(var e=this,i=this.model.get("difficulties")||[];i.length<2;)i.push(this.createEmptyDifficulty());i.push(this.createEmptyDifficulty()),this.$id("difficulties").html(i.map(function(i){return m({difficulty:i,i:++e.rowIndex})}).join(""))},createEmptyRisk:function(){return{risk:"",cause:"",easy:null}},createEmptyDifficulty:function(){return{problem:"",solution:"",behavior:null}},handleSuccess:function(){return localStorage.removeItem("BOC_LAST"),l.prototype.handleSuccess.apply(this,arguments)},showRidEditor:function(e,i){function t(i){a.popover("destroy").closest(".message").find(".behaviorObsCards-form-rid-message").html(s.t("FORM:MSG:"+e+":"+(i?"edit":"add"),{rid:i})),s.model.attributes[e]=i,s.$("input[name="+e+"]").val(i||"")}var s=this,a=s.$(i);if(a.next(".popover").length)return void a.popover("destroy");a.popover({placement:"auto top",html:!0,trigger:"manual",content:b({idPrefix:this.idPrefix,helpers:this.getTemplateHelpers(),property:e,rid:this.model.get(e)||""})}).popover("show");var n=a.next(".popover"),o=n.find(".form-control").select(),l=n.find(".btn-default"),d=n.find(".btn-link");d.on("click",function(){a.popover("destroy")}),o.on("keydown",function(e){if(13===e.keyCode)return!1}),o.on("keyup",function(e){if(13===e.keyCode)return l.click(),!1}),l.on("click",function(){o.prop("disabled",!0),l.prop("disabled",!0),d.prop("disabled",!0);var i=parseInt(o.val(),10)||0;if(i<=0)return t(null);var a=("nearMiss"===e?"/kaizen/orders":"/suggestions")+"/"+i,n=s.ajax({url:a});return n.fail(function(e){s.showErrorMessage(r("behaviorObsCards","FORM:ridEditor:"+(404===e.status?"notFound":"failure"))),o.prop("disabled",!1),l.prop("disabled",!1),d.prop("disabled",!1),(404===e.status?o:l).focus()}),n.done(function(){t(i)}),!1})}})});