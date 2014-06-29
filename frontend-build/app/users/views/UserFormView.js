// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/ZeroClipboard","app/i18n","app/data/views/OrgUnitDropdownsView","app/core/Model","app/core/views/FormView","app/data/aors","app/data/companies","app/data/divisions","app/data/subdivisions","app/data/prodFunctions","app/data/privileges","app/users/templates/form"],function(i,e,t,n,s,o,r,a,l,d,p,u,c){var v=n.ORG_UNIT;return o.extend({template:c,idPrefix:"userForm",events:{submit:"submitForm",'input input[type="password"]':function(i){null!==this.timers.validatePasswords&&clearTimeout(this.timers.validatePasswords),this.timers.validatePasswords=setTimeout(this.validatePasswords.bind(this,i),100)}},initialize:function(){o.prototype.initialize.call(this),this.orgUnitDropdownsView=new n({orgUnit:v.SUBDIVISION,allowClear:!0}),this.setView(".orgUnitDropdowns-container",this.orgUnitDropdownsView)},destroy:function(){this.$('.select2-offscreen[tabindex="-1"]').select2("destroy"),this.privilegesCopyClient&&this.privilegesCopyClient.destroy()},afterRender:function(){o.prototype.afterRender.call(this),this.options.editMode||this.$('input[type="password"]').attr("required",!0),this.$id("aors").select2({width:"100%",allowClear:!0}),this.setUpProdFunctionSelect2(),this.setUpCompanySelect2(),this.setUpVendorSelect2(),this.setUpPrivilegesControls(),this.listenToOnce(this.orgUnitDropdownsView,"afterRender",function(){var i=null,e=null;switch(this.model.get("orgUnitType")){case"division":e=v.DIVISION,i=new s({division:this.model.get("orgUnitId")});break;case"subdivision":e=v.SUBDIVISION,i=new s({subdivision:this.model.get("orgUnitId")})}this.orgUnitDropdownsView.selectValue(i,e)})},setUpPrivilegesControls:function(){var i={},n=[];u.forEach(function(e){var s=t("users","PRIVILEGE:"+e);i[s]=e,n.push({id:e,text:s})});var s=this.$id("privileges").select2({width:"100%",allowClear:!1,tags:n,tokenSeparators:[";"],createSearchChoice:function(e){var t=e.trim(),n=i[t];return n?{id:n,text:t}:null}});this.privilegesCopyClient=new e(this.$id("copyPrivileges")),this.privilegesCopyClient.on("load",function(i){i.on("datarequested",function(i){var e=s.select2("data");i.setText(0===e.length?"":e.map(function(i){return i.text}).join(";")+";")})}),this.privilegesCopyClient.on("wrongflash noflash",function(){e.destroy()})},setUpProdFunctionSelect2:function(){this.$id("prodFunction").select2({width:"100%",allowClear:!0,data:this.getProdFunctionsForCompany()})},setUpCompanySelect2:function(){var i=this.$id("company").select2({width:"100%",allowClear:!0}),e=this.$id("prodFunction"),t=this;i.on("change",function(){var i=e.val();e.select2("val",null),t.setUpProdFunctionSelect2(),e.select2("val",i)})},setUpVendorSelect2:function(){function i(i){var e=i._id;return i.name&&(e+=": "+i.name),{id:i._id,text:e}}var e=this.$id("vendor").select2({width:"100%",allowClear:!0,minimumInputLength:3,placeholder:t("users","NO_DATA:vendor"),ajax:{cache:!0,quietMillis:300,url:function(i){i=i.trim();var e=/^[0-9]+$/.test(i)?"_id":"name";return i=encodeURIComponent(i),"/vendors?sort("+e+")&limit(50)&regex("+e+",string:"+i+",i)"},results:function(e){return{results:e.collection.map(i)}}}}),n=this.model.get("vendor");n&&n._id&&e.select2("data",i(n))},getProdFunctionsForCompany:function(){var i=this.$id("company").val();return""===i?[]:p.filter(function(e){return-1!==e.get("companies").indexOf(i)}).map(function(i){return{id:i.id,text:i.getLabel()}})},validatePasswords:function(){var i=this.$id("password"),e=this.$id("password2");e[0].setCustomValidity(i.val()===e.val()?"":t("users","FORM:ERROR:passwordMismatch")),this.timers.validatePassword=null},serialize:function(){return i.extend(o.prototype.serialize.call(this),{aors:r.toJSON(),companies:a.toJSON(),privileges:u})},serializeToForm:function(){var i=this.model.toJSON();return i.privileges=i.privileges.join(","),i.vendor=null,i},serializeForm:function(e){return e=i.defaults(e,{privileges:[],aors:[]}),"string"==typeof e.aors&&(e.aors=e.aors.split(",")),"string"==typeof e.privileges&&(e.privileges=e.privileges.split(",")),e.company&&e.company.length||(e.company=null),e.prodFunction&&e.prodFunction.length||(e.prodFunction=null),e.vendor&&e.vendor.length||(e.vendor=null),e.subdivision?(e.orgUnitType="subdivision",e.orgUnitId=e.subdivision):e.division?(e.orgUnitType="division",e.orgUnitId=e.division):(e.orgUnitType="unspecified",e.orgUnitId=null),e}})});