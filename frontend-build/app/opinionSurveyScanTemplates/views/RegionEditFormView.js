// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/viewport","app/core/View","app/opinionSurveyScanTemplates/templates/regionEditForm","app/opinionSurveyScanTemplates/templates/regionEditFormOptionRow"],function(e,t,n,i,s,o){"use strict";return i.extend({template:s,events:{submit:function(e){e.preventDefault();var t=this.$id("question").val(),n=this.$id("options").find("tr").map(function(){return this.dataset.id}).get();this.trigger("success",{question:t,options:n})},"change #-question":function(n){if(this.setUpAnswersSelect2(),this.$id("options").empty(),n.added&&!e.includes(["comment","employer","superior"],n.added.id)){var i=this;["no","na","yes"].forEach(function(e){i.addOption(e,t("opinionSurveyScanTemplates","regionEditForm:answer:"+e))})}this.$id("answers").select2("focus")},"change #-answers":function(e){var t=e.added;t&&(this.addOption(t.id,t.text),this.$id("answers").select2("data",null))},'click .btn[data-action="up"]':function(e){var t=this.$(e.currentTarget).closest("tr"),n=t.prev();n.length&&(t.insertBefore(n),this.recountOptions()),e.currentTarget.focus()},'click .btn[data-action="down"]':function(e){var t=this.$(e.currentTarget).closest("tr"),n=t.next();n.length&&(t.insertAfter(n),this.recountOptions()),e.currentTarget.focus()},'click .btn[data-action="remove"]':function(e){var t=this,n=this.$(e.currentTarget).closest("tr");n.fadeOut("fast",function(){n.remove(),t.recountOptions()})}},initialize:function(){this.answerIdToTextMap={}},serialize:function(){return{idPrefix:this.idPrefix,region:this.model.region}},onDialogShown:function(){this.$id("question").select2("focus")},afterRender:function(){this.$id("question").select2({allowClear:!0,placeholder:" ",data:this.createQuestionData()}),this.setUpAnswersSelect2(),this.model.region.options.forEach(function(e){var t=this.answerIdToTextMap[e];t&&this.addOption(e,t)},this)},setUpAnswersSelect2:function(){this.$id("answers").select2({placeholder:" ",data:this.createAnswersData()})},createQuestionData:function(){var e=[{id:"comment",text:t("opinionSurveyScanTemplates","regionType:comment")},{id:"employer",text:t("opinionSurveyScanTemplates","regionType:employer")},{id:"superior",text:t("opinionSurveyScanTemplates","regionType:superior")}],n=this.model.survey?this.model.survey.get("questions"):[];return n.forEach(function(t){e.push({id:t._id,text:t.short})}),e},createAnswersData:function(){var e,n=this.model.survey,i=this.$id("question").val();switch(i){case"":case"comment":e=[];break;case"employer":e=n?n.get("employers").map(function(e){return{id:e._id,text:e.full}}):[];break;case"superior":e=n?n.get("superiors").map(function(e){return{id:e._id,text:e.full}}):[];break;default:e=["no","na","yes"].map(function(e){return{id:e,text:t("opinionSurveyScanTemplates","regionEditForm:answer:"+e)}})}return this.answerIdToTextMap={},e.forEach(function(e){this.answerIdToTextMap[e.id]=e.text},this),e},addOption:function(e,t){var n=this.$id("options");n.append(o({id:e,answer:t,no:n.children().length+1}))},recountOptions:function(){this.$id("options").find(".is-number").each(function(e){this.textContent=e+1+"."})}})});