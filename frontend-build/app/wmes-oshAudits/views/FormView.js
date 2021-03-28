define(["underscore","app/time","app/user","app/core/util/idAndLabel","app/core/util/buttonGroup","app/core/views/FormView","app/users/util/setUpUserSelect2","app/kaizenOrders/dictionaries","../OshAudit","app/wmes-oshAudits/templates/form","app/wmes-oshAudits/templates/_formResult"],function(e,t,i,n,o,a,s,r,l,u,d){"use strict";return a.extend({template:u,events:Object.assign({"click .oshAudits-form-radio":function(e){"TD"===e.target.tagName&&e.target.querySelector('input[type="radio"]').click()},'mousedown input[type="radio"]':function(e){e.preventDefault()},'mouseup input[type="radio"]':function(e){e.preventDefault()},'click input[type="radio"]':function(e){var t=this,i=e.target,n=t.$(i).closest("tr"),o=n.find('input[name="'+i.name+'"][value="-1"]');o.length&&(e.preventDefault(),setTimeout(function(){i.checked=!i.checked,i.checked||o.prop("checked",!0),t.toggleResult(n),t.toggleValidity()},1))},"click #-addOther":function(){var e=r.controlCategories.get("000000000000000000000000");this.addResult({category:e.id,shortName:e.get("shortName"),fullName:e.get("fullName"),ok:!1,comment:"",owner:null})},"change #-auditor":function(){this.setUpSectionSelect2(),this.renderResults()},"change #-section":function(){this.renderResults()}},a.prototype.events),initialize:function(){a.prototype.initialize.apply(this,arguments),this.resultI=0},toggleValidity:function(){var e=!!this.$('input[value="0"]:checked').length;this.$('input[value="1"]').first()[0].setCustomValidity(e?"":this.t("FORM:empty"))},checkValidity:function(e){return e.results.some(function(e){return null!==e.ok})},serializeToForm:function(){var e=this.model.toJSON();return e.status||(e.status="new"),e.date=t.format(e.date||new Date,"YYYY-MM-DD"),e},serializeForm:function(e){var i=this.$id("auditor").select2("data"),n=t.getMoment(e.date,"YYYY-MM-DD");e.auditor={id:i.id,label:i.text},e.date=n.isValid()?n.toISOString():null;var o=this.$('input[name$=".owner"]');return e.results=(e.results||[]).map(function(e,t){return e.ok="1"===e.ok||"0"!==e.ok&&null,!1!==e.ok&&(e.comment="",e.owner=null),e.owner?e.owner=s.getUserInfo(o.eq(t)):e.owner=null,e}),e},afterRender:function(){a.prototype.afterRender.call(this),o.toggle(this.$id("statusGroup")),this.setUpAuditorSelect2(),this.setUpSectionSelect2(),this.renderResults()},setUpAuditorSelect2:function(){var e=this.model.get("auditor")||i.getInfo(),t={};t[e.id]={id:e.id,text:e.label},r.sections.forEntryType("audits").forEach(function(e){e.get("active")&&e.get("auditors").forEach(function(e){t[e.id]={id:e.id,text:e.label}})}),this.$id("auditor").val(e.id).select2({data:Object.values(t)}).select2("enable",!this.options.editMode&&l.can.manage())},setUpSectionSelect2:function(){var e=l.can.manage(),t=r.sections.get(this.model.get("section")),i=this.$id("auditor").val(),o={};t&&(o[t.id]=n(t)),r.sections.forEntryType("audits").forEach(function(t){t.get("active")&&(e||t.get("auditors").some(function(e){return e.id===i}))&&(o[t.id]=n(t))}),o=Object.values(o);var a=this.$id("section");t?a.val(t.id):1===o.length?a.val(o[0].id):a.val(""),a.select2({data:o}),a.select2("enable",!this.options.editMode&&e)},renderResults:function(){var e=this;if(e.options.editMode)return e.model.get("results").forEach(e.addResult,e),void e.toggleValidity();var t=r.sections.get(e.$id("section").val());e.$id("results").empty(),t&&(t.get("controlLists").forEach(function(t){var i=r.controlLists.get(t);if(i&&i.get("active")){var n={};i.get("categories").forEach(function(t){n[t._id]||(n[t._id]=!0,e.addResult({category:t._id,shortName:t.shortName,fullName:t.fullName,ok:null,comment:"",owner:null}))})}}),e.toggleValidity())},addResult:function(e){var t=this.renderPartial(d,{i:++this.resultI,result:e});this.$id("results").append(t);var i=s(t.find('input[name$=".owner"]'),{allowClear:!0,view:this});e.owner&&i.select2("data",{id:e.owner.id,text:e.owner.label}),!1!==e.ok&&i.select2("enable",!1)},toggleResult:function(e){var t=0===+e.find('input[name$=".ok"]:checked').val();e.find("textarea").prop("disabled",!t),e.find('[name$=".owner"]').prop("required",!1).select2("enable",t).parent().toggleClass("has-required-select2",!1)}})});