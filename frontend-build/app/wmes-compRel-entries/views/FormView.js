define(["underscore","jquery","app/user","app/time","app/viewport","app/core/views/FormView","app/core/util/idAndLabel","app/core/util/html","app/core/templates/userInfo","app/data/orgUnits","app/users/util/setUpUserSelect2","app/mrpControllers/util/setUpMrpSelect2","../dictionaries","../Entry","app/wmes-compRel-entries/templates/form","app/wmes-compRel-entries/templates/formComponent","app/wmes-compRel-entries/templates/formFunc"],function(e,t,n,i,s,a,o,c,u,r,l,d,p,m,h,f,v){"use strict";return a.extend({template:h,events:e.assign({"change #-oldComponents":function(){this.checkComponentValidity("old")},"change #-newComponents":function(){this.checkComponentValidity("new")},'input input[name$="._id"]':"resolveComponent","click #-addFunc":function(){var e=this.$id("availableFuncs").val();e&&(this.addFunc(e,!this.model.getFunc(e)),this.setUpAvailableFuncs())},"change #-availableFuncs":function(){var e=this.$id("availableFuncs").val();this.addFunc(e,!this.model.getFunc(e)),this.setUpAvailableFuncs()},"click .compRel-form-removeFunc":function(e){this.removeFunc(this.$(e.target).closest(".compRel-form-func")[0].dataset.id)},"click #-addOldComponent":function(){this.addComponent("old",{_id:"",name:""}),this.$id("oldComponents").children().last().find("input").first().focus(),this.checkComponentValidity("old")},"click #-addNewComponent":function(){this.addComponent("new",{_id:"",name:""}),this.$id("newComponents").children().last().find("input").first().focus(),this.checkComponentValidity("new")},'click [data-action="removeComponent"]':function(e){var t=this.$(e.target).closest("tbody");t.children().length>1&&(this.$(e.target).closest("tr").remove(),this.checkComponentValidity(t[0].dataset.type))},"change #-mrps":function(){var e=[];this.$(".compRel-form-func").each(function(){e.push(this.dataset.id)}),this.loadFuncUsers(e)},'change input[name$=".users"]':function(e){this.saveFuncUsers(this.$(e.target).closest(".compRel-form-func")[0].dataset.id)}},a.prototype.events),initialize:function(){a.prototype.initialize.apply(this,arguments),this.compI=0,this.funcI=0},afterRender:function(){var e=this;a.prototype.afterRender.apply(e,arguments),e.setUpMrpSelect2(),e.setUpReasonSelect2(),(e.model.get("oldComponents")||[]).forEach(function(t){e.addComponent("old",t)}),(e.model.get("newComponents")||[]).forEach(function(t){e.addComponent("new",t)}),e.addComponent("old",{_id:"",name:""}),e.addComponent("new",{_id:"",name:""}),(e.model.get("funcs")||[]).forEach(function(t){e.addFunc(t._id,!1)}),e.setUpUsersSelect2(),e.setUpAvailableFuncs()},checkFuncsValidity:function(){this.$id("availableFuncs")[0].setCustomValidity(this.$(".compRel-form-func").length?"":this.t("FORM:ERROR:noFuncs"))},serializeToForm:function(){var e=this.model.toJSON();return e.mrps=e.mrps?e.mrps.join(","):"",e},serializeForm:function(e){var t=this;return e.mrps=e.mrps.split(","),e.funcs=[],this.$(".compRel-form-func").each(function(){e.funcs.push(t.model.getFunc(this.dataset.id))}),e},setUpMrpSelect2:function(){d(this.$id("mrps"),{view:this,own:!1,width:"100%"})},setUpReasonSelect2:function(){var e=this.model.get("reason");this.$id("reason").select2({width:"100%",data:p.reasons.filter(function(t){return t.id===e||t.get("active")}).map(o)})},setUpUsersSelect2:function(){var e=this,t=e.model.get("funcs");e.$('input[name$=".users"]').each(function(n){l(e.$(this),{width:"100%",multiple:!0,allowClear:!0,noPersonnelId:!0}).select2("data",t[n].users.map(function(e){return{id:e.id,text:e.label}}))})},setUpAvailableFuncs:function(){var e={};p.funcs.forEach(function(t){e[t.id]=t}),this.$(".compRel-form-func").each(function(){delete e[this.dataset.id]});var t="";Object.values(e).forEach(function(e,n){t+=c.tag("option",{value:e.id,selected:0===n},e.getLabel())}),this.$id("availableFuncs").html(t).prop("disabled",!t),this.$id("addFunc").prop("disabled",!t),this.checkFuncsValidity()},resolveComponent:function(e){var t=e.currentTarget,n=this.$(t).closest("tr").find('input[name$=".name"]')[0];if(n.value="",/^[0-9]{12}$/.test(t.value.trim())){var i="validate"+t.name;this[i]&&this[i].abort(),s.msg.loading(),this[i]=this.ajax({url:"/compRel/entries;resolve-component",data:{nc12:t.value}}),this[i].done(function(e){n.value=e.name}),this[i].always(function(){s.msg.loaded()})}},checkComponentValidity:function(e){var n=!1,i=this.$id(e+"Components").children();i.each(function(){var e=t(this).find("input"),i=!1;e.each(function(){i=i||this.value.trim().length>0}),e.prop("required",i),n=n||i}),n||i.first().find("input").prop("required",!0)},addComponent:function(e,t){var n=this.renderPartial(f,{i:++this.compI,type:e,component:t});this.$id(e+"Components").append(n)},addFunc:function(e,t){if(!this.$func(e).length){var n=this.model.getFunc(e);n||(n={_id:e,acceptedAt:null,acceptedBy:null,status:"pending",comment:"",users:[]},this.model.attributes.funcs=(this.model.get("funcs")||[]).concat(n));var s=this.renderPartial(v,{i:++this.funcI,status:n.status,func:{_id:e,label:p.funcs.getLabel(e),acceptedAt:n.acceptedAt?i.format(n.acceptedAt,"LL, HH:mm"):"-",acceptedBy:n.acceptedBy?u({userInfo:n.acceptedBy,noIp:!0}):"-",status:this.t("status:"+n.status)}});this.$id("funcs").append(s),l(s.find('input[name$=".users"]'),{view:this,multiple:!0,noPersonnelId:!0}).select2("data",n.users.map(function(e){return{id:e.id,text:e.label}})),t&&this.loadFuncUsers([e])}},removeFunc:function(e){this.$func(e).remove(),this.setUpAvailableFuncs()},loadFuncUsers:function(e){if(e.length){var t=this;s.msg.loading();var n=t.ajax({url:"/compRel/entries;resolve-users",data:{funcs:e.join(","),mrps:t.$id("mrps").val()}});n.done(function(e){Object.keys(e).forEach(function(n){t.updateFuncUsers(n,e[n])})}),n.always(function(){s.msg.loaded()})}},updateFuncUsers:function(e,t){var n=this.$func(e);n.length&&(t.sort(function(e,t){return e.label.localeCompare(t.label,void 0,{ignorePunctuation:!0})}),n.find('input[name$=".users"]').select2("data",t.map(function(e){return{id:e.id,text:e.label}})),this.saveFuncUsers(e))},saveFuncUsers:function(e){var t=this.model.getFunc(e),n=this.$func(e).find('input[name$=".users"]').select2("data").map(function(e){return{id:e.id,label:e.text}});t&&(t.users=n)},$func:function(e){return this.$('.compRel-form-func[data-id="'+e+'"]')}})});