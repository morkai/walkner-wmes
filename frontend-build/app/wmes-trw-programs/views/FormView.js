define(["underscore","app/core/views/FormView","app/core/util/idAndLabel","app/wmes-trw-tests/dictionaries","../Program","app/wmes-trw-programs/templates/form"],function(t,e,i,n,s,o){"use strict";return e.extend({template:o,events:t.assign({"click #-addStep":function(){this.addStep()},'click [data-action="removeStep"]':function(t){var e=this,i=e.$(t.target).closest(".panel");i.fadeOut("fast",function(){i.remove(),e.recountSteps()})},'click [data-action="moveStepUp"]':function(t){var e=this.$(t.target).closest(".panel");e.insertBefore(e.prev()),this.recountSteps()},'click [data-action="moveStepDown"]':function(t){var e=this.$(t.target).closest(".panel");e.insertAfter(e.next()),this.recountSteps()},'change input[name$=".name"]':function(t){this.updateStepTitle(this.$(t.target).closest(".panel")[0])},"change #-tester":function(){this.loadTester()}},e.prototype.events),initialize:function(){e.prototype.initialize.apply(this,arguments),this.stepI=0,this.io=null},afterRender:function(){(this.model.get("steps")||[]).forEach(this.addStep,this),e.prototype.afterRender.call(this),this.$id("tester").select2({data:n.testers.map(i)}),this.addStep(),this.loadTester()},serializeForm:function(t){return t.steps||(t.steps=[]),t.steps.forEach(function(t){t.setIo=(t.setIo||"").split(",").filter(function(t){return t.length>0}),t.checkIo=(t.checkIo||"").split(",").filter(function(t){return t.length>0})}),t.steps=t.steps.filter(function(t){return!!(t.name||t.description||t.setIo.length||t.checkIo.length)}),t},addStep:function(t){var e=this.$id("steps");this.stepTemplate||(this.stepTemplate=e.html(),e.html(""));var i=this.stepTemplate.replace(/\${i}/g,this.stepI);e.append(i);var n=this.$(e[0].lastElementChild);this.updateStepTitle(n[0],e[0].childElementCount,t&&t.name||""),this.setUpIoSelect2(n),++this.stepI},updateStepTitle:function(t,e,i){null==e&&(e=Array.prototype.indexOf.call(t.parentNode.children,t)+1);var n=this.t("steps:hd",{n:e});null==i&&(i=t.querySelector('input[name$="name"]').value),i&&(n+=": "+s.colorize(i)),t.querySelector(".panel-heading-text").innerHTML=n},recountSteps:function(){var t=this;t.$id("steps").children().each(function(e){t.updateStepTitle(this,e+1)})},setUpIoSelect2:function(e){var i=this;(e||i.$id("steps").children()).each(function(){var e=i.$(this),n=e.find('input[name$="setIo"]'),s=e.find('input[name$="checkIo"]');if(null===i.io)return n.prop("readonly",!0).addClass("form-control"),void s.prop("readonly",!0).addClass("form-control");n.val(t.intersection(n.val().split(",").filter(function(t){return t.length>0}),i.io.outputIds).join(",")),n.prop("readonly",!1).removeClass("form-control").select2({multiple:!0,allowClear:!0,data:i.io.output}),s.val(t.intersection(s.val().split(",").filter(function(t){return t.length>0}),i.io.inputIds).join(",")),s.prop("readonly",!1).removeClass("form-control").select2({multiple:!0,allowClear:!0,data:i.io.input})})},loadTester:function(){var t=this,e=t.$id("tester").val();e&&t.ajax({url:"/trw/testers/"+e}).done(function(e){t.io={},e.io.forEach(function(e){t.io[e.type]||(t.io[e.type]=[],t.io[e.type+"Ids"]=[]),t.io[e.type].push({id:e._id,text:e.name+" ["+e.device+":"+e.channel+"]"}),t.io[e.type+"Ids"].push(e._id)}),t.setUpIoSelect2()})}})});