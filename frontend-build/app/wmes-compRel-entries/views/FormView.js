define(["underscore","jquery","app/user","app/time","app/viewport","app/core/views/FormView","app/core/util/idAndLabel","app/core/util/html","app/core/templates/userInfo","app/data/orgUnits","app/users/util/setUpUserSelect2","app/mrpControllers/util/setUpMrpSelect2","../dictionaries","../Entry","app/wmes-compRel-entries/templates/form","app/wmes-compRel-entries/templates/formComponent","app/wmes-compRel-entries/templates/formFunc"],function(t,e,n,i,s,a,o,c,u,r,l,d,p,m,h,f,v){"use strict";return a.extend({template:h,events:t.assign({"change #-oldComponents":function(){this.checkComponentValidity("old")},"change #-newComponents":function(){this.checkComponentValidity("new")},'input input[name$="._id"]':"resolveComponent","click #-addFunc":function(){var t=this.$id("availableFuncs").val();t&&(this.addFunc(t,!this.model.getFunc(t)),this.setUpAvailableFuncs())},"change #-availableFuncs":function(){var t=this.$id("availableFuncs").val();this.addFunc(t,!this.model.getFunc(t)),this.setUpAvailableFuncs()},"click .compRel-form-removeFunc":function(t){this.removeFunc(this.$(t.target).closest(".compRel-form-func")[0].dataset.id)},"click #-addOldComponent":function(){this.addComponent("old",{_id:"",name:""}),this.$id("oldComponents").children().last().find("input").first().focus(),this.checkComponentValidity("old")},"click #-addNewComponent":function(){this.addComponent("new",{_id:"",name:""}),this.$id("newComponents").children().last().find("input").first().focus(),this.checkComponentValidity("new")},'click [data-action="removeComponent"]':function(t){var e=this.$(t.target).closest("tbody");e.children().length>1&&(this.$(t.target).closest("tr").remove(),this.checkComponentValidity(e[0].dataset.type))},"change #-mrps":function(){var t=[];this.$(".compRel-form-func").each(function(){t.push(this.dataset.id)}),this.loadFuncUsers(t)},'change input[name$=".users"]':function(t){this.saveFuncUsers(this.$(t.target).closest(".compRel-form-func")[0].dataset.id)}},a.prototype.events),initialize:function(){a.prototype.initialize.apply(this,arguments),this.compI=0,this.funcI=0},afterRender:function(){var t=this;a.prototype.afterRender.apply(t,arguments),t.setUpMrpSelect2(),t.setUpReasonSelect2(),(t.model.get("oldComponents")||[]).forEach(function(e){t.addComponent("old",e)}),(t.model.get("newComponents")||[]).forEach(function(e){t.addComponent("new",e)}),(t.model.get("funcs")||[]).forEach(function(e){t.addFunc(e._id,!1)}),t.setUpUsersSelect2(),t.setUpAvailableFuncs()},checkFuncsValidity:function(){this.$id("availableFuncs")[0].setCustomValidity(this.$(".compRel-form-func").length?"":this.t("FORM:ERROR:noFuncs"))},serializeToForm:function(){var t=this.model.toJSON();return t.mrps=t.mrps?t.mrps.join(","):"",t},serializeForm:function(t){var e=this;return t.mrps=t.mrps.split(","),t.funcs=[],this.$(".compRel-form-func").each(function(){t.funcs.push(e.model.getFunc(this.dataset.id))}),t},setUpMrpSelect2:function(){d(this.$id("mrps"),{view:this,own:!1,width:"100%"})},setUpReasonSelect2:function(){var t=this.model.get("reason");this.$id("reason").select2({width:"100%",data:p.reasons.filter(function(e){return e.id===t||e.get("active")}).map(o)})},setUpUsersSelect2:function(){var t=this,e=t.model.get("funcs");t.$('input[name$=".users"]').each(function(n){l(t.$(this),{width:"100%",multiple:!0,allowClear:!0,noPersonnelId:!0}).select2("data",e[n].users.map(function(t){return{id:t.id,text:t.label}}))})},setUpAvailableFuncs:function(){var t={};p.funcs.forEach(function(e){t[e.id]=e}),this.$(".compRel-form-func").each(function(){delete t[this.dataset.id]});var e="";Object.values(t).forEach(function(t,n){e+=c.tag("option",{value:t.id,selected:0===n},t.getLabel())}),this.$id("availableFuncs").html(e).prop("disabled",!e),this.$id("addFunc").prop("disabled",!e),this.checkFuncsValidity()},resolveComponent:function(t){var e=t.currentTarget,n=this.$(e).closest("tr").find('input[name$=".name"]')[0];if(n.value="",/^[0-9]{12}$/.test(e.value.trim())){var i="validate"+e.name;this[i]&&this[i].abort(),s.msg.loading(),this[i]=this.ajax({url:"/compRel/entries;resolve-component",data:{nc12:e.value}}),this[i].done(function(t){n.value=t.name}),this[i].always(function(){s.msg.loaded()})}},checkComponentValidity:function(t){var n=!1,i=this.$id(t+"Components").children();i.each(function(){var t=e(this).find("input"),i=!1;t.each(function(){i=i||this.value.trim().length>0}),t.prop("required",i),n=n||i}),n||i.first().find("input").prop("required",!0)},addComponent:function(t,e){var n=this.renderPartial(f,{i:++this.compI,type:t,component:e});this.$id(t+"Components").append(n)},addFunc:function(t,e){if(!this.$func(t).length){var n=this.model.getFunc(t);n||(n={_id:t,acceptedAt:null,acceptedBy:null,status:"pending",comment:"",users:[]},this.model.attributes.funcs=(this.model.get("funcs")||[]).concat(n));var s=this.renderPartial(v,{i:++this.funcI,status:n.status,func:{_id:t,label:p.funcs.getLabel(t),acceptedAt:n.acceptedAt?i.format(n.acceptedAt,"LL, HH:mm"):"-",acceptedBy:n.acceptedBy?u({userInfo:n.acceptedBy,noIp:!0}):"-",status:this.t("status:"+n.status)}});this.$id("funcs").append(s),l(s.find('input[name$=".users"]'),{view:this,multiple:!0,noPersonnelId:!0}).select2("data",n.users.map(function(t){return{id:t.id,text:t.label}})),e&&this.loadFuncUsers([t])}},removeFunc:function(t){this.$func(t).remove(),this.setUpAvailableFuncs()},loadFuncUsers:function(t){if(t.length){var e=this;s.msg.loading();var n=e.ajax({url:"/compRel/entries;resolve-users",data:{funcs:t.join(","),mrps:e.$id("mrps").val()}});n.done(function(t){Object.keys(t).forEach(function(n){e.updateFuncUsers(n,t[n])})}),n.always(function(){s.msg.loaded()})}},updateFuncUsers:function(t,e){var n=this.$func(t);n.length&&(e.sort(function(t,e){return t.label.localeCompare(e.label,void 0,{ignorePunctuation:!0})}),n.find('input[name$=".users"]').select2("data",e.map(function(t){return{id:t.id,text:t.label}})),this.saveFuncUsers(t))},saveFuncUsers:function(t){var e=this.model.getFunc(t),n=this.$func(t).find('input[name$=".users"]').select2("data").map(function(t){return{id:t.id,label:t.text}});e&&(e.users=n)},$func:function(t){return this.$('.compRel-form-func[data-id="'+t+'"]')}})});