// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/ZeroClipboard","app/i18n","app/user","app/core/Model","app/core/views/FormView","app/core/util/idAndLabel","app/data/views/OrgUnitDropdownsView","app/data/aors","app/data/companies","app/data/divisions","app/data/subdivisions","app/data/prodFunctions","app/data/privileges","app/data/loadedModules","app/vendors/util/setUpVendorSelect2","app/users/templates/formMobileList","app/users/templates/form"],function(i,e,t,s,o,r,n,l,a,d,p,u,h,c,m,v,f,g,b){"use strict";var w=a.ORG_UNIT;return n.extend({template:b,events:{submit:"submitForm",'input input[type="password"]':function(i){null!==this.timers.validatePasswords&&clearTimeout(this.timers.validatePasswords),this.timers.validatePasswords=setTimeout(this.validatePasswords.bind(this,i),30)},"change #-aors":"resizeColumns","keydown #-mobile":function(i){return 13===i.keyCode?(this.$id("mobile-add").click(),!1):void 0},"click #-mobile-add":function(){var i=this.$id("mobile-number"),e=this.$id("mobile-from"),t=this.$id("mobile-to");this.addMobile(i.val(),e.val(),t.val()),this.renderMobileList(),i.val("").focus(),e.val(""),t.val("")},"click .users-form-mobile-remove":function(i){return this.removeMobile(this.$(i.target).closest("li").attr("data-number")),this.$id("mobile-number").select(),!1}},initialize:function(){n.prototype.initialize.call(this),this.mobileList=null,this.accountMode=this.options.editMode&&o.data._id===this.model.id&&!o.isAllowedTo("USERS:MANAGE"),this.orgUnitDropdownsView=new a({orgUnit:w.SUBDIVISION,allowClear:!0}),this.setView(".orgUnitDropdowns-container",this.orgUnitDropdownsView),this.listenTo(this.orgUnitDropdownsView,"afterRender",this.resizeColumns),e(window).on("resize."+this.idPrefix,i.debounce(this.resizeColumns.bind(this),16))},destroy:function(){e(window).off("."+this.idPrefix),this.privilegesCopyClient&&this.privilegesCopyClient.destroy()},afterRender:function(){n.prototype.afterRender.call(this),this.accountMode||(this.$id("aors").select2({width:"100%",allowClear:!0}),this.setUpProdFunctionSelect2(),this.setUpCompanySelect2(),this.setUpVendorSelect2(),this.setUpPrivilegesControls(),this.listenToOnce(this.orgUnitDropdownsView,"afterRender",this.setUpOrgUnitDropdowns)),this.resizeColumns(),this.mobileList||(this.mobileList=this.model.get("mobile")||[]),this.renderMobileList()},setUpOrgUnitDropdowns:function(){var i=null,e=null;switch(this.model.get("orgUnitType")){case"division":e=w.DIVISION,i=new r({division:this.model.get("orgUnitId")});break;case"subdivision":e=w.SUBDIVISION,i=new r({subdivision:this.model.get("orgUnitId")})}this.orgUnitDropdownsView.selectValue(i,e)},setUpPrivilegesControls:function(){var i={},e=[];m.forEach(function(t){var o=s("users","PRIVILEGE:"+t);i[o]=t,e.push({id:t,text:o})});var o=this.$id("privileges").select2({width:"100%",allowClear:!1,tags:e,tokenSeparators:[";"],createSearchChoice:function(e){var t=e.trim(),s=i[t];return s?{id:s,text:t}:null}});this.privilegesCopyClient=new t(this.$id("copyPrivileges")),this.privilegesCopyClient.on("load",function(i){i.on("datarequested",function(i){var e=o.select2("data");0===e.length?i.setText(""):i.setText(e.map(function(i){return i.text}).join(";")+";")})}),this.privilegesCopyClient.on("wrongflash noflash",function(){t.destroy()})},setUpProdFunctionSelect2:function(){this.$id("prodFunction").select2({width:"100%",allowClear:!0,data:c.map(l)})},setUpCompanySelect2:function(){this.$id("company").select2({width:"100%",allowClear:!0})},setUpVendorSelect2:function(){var i=this.$id("vendor");if(!v.isLoaded("vendors"))return void i.closest(".form-group").remove();f(i,{placeholder:s("users","NO_DATA:vendor")});var e=this.model.get("vendor");e&&e._id&&i.select2("data",i.prepareData(e))},validatePasswords:function(){var i=this.$id("password"),e=this.$id("password2");i.val()===e.val()?e[0].setCustomValidity(""):e[0].setCustomValidity(s("users","FORM:ERROR:passwordMismatch")),this.timers.validatePassword=null},serialize:function(){return i.extend(n.prototype.serialize.call(this),{aors:d.toJSON(),companies:p.toJSON(),privileges:m,accountMode:this.accountMode})},serializeToForm:function(){var i=this.model.toJSON();return i.active=i.active.toString(),i.privileges=i.privileges.join(","),i.vendor=null,i},serializeForm:function(e){return e=i.defaults(e,{privileges:[],aors:[]}),["firstName","lastName","personellId","email"].forEach(function(i){e[i]&&e[i].length||(e[i]="")}),["company","prodFunction","vendor"].forEach(function(i){e[i]&&e[i].length||(e[i]=null)}),"string"==typeof e.aors&&(e.aors=e.aors.split(",")),"string"==typeof e.privileges&&(e.privileges=e.privileges.split(",")),e.subdivision?(e.orgUnitType="subdivision",e.orgUnitId=e.subdivision):e.division?(e.orgUnitType="division",e.orgUnitId=e.division):(e.orgUnitType="unspecified",e.orgUnitId=null),e.mobile=this.serializeMobile(),e.kdId=parseInt(e.kdId,10),(isNaN(e.kdId)||e.kdId<1)&&(e.kdId=-1),e},serializeMobile:function(){var e={};return i.forEach(this.mobileList,function(i){e[i.number]=i}),i.values(e)},resizeColumns:function(){var i=this.$(".col-lg-3"),t=null,s=0;i.each(function(){var i=e(this).css("height",""),o=i.outerHeight();o>s&&(t=i,s=o)}),window.innerWidth>=1200&&i.each(function(){this.style.height=this===t[0]?"":s+"px"})},renderMobileList:function(){this.$id("mobile-list").html(g({mobileList:this.mobileList}))},removeMobile:function(i){this.mobileList=this.mobileList.filter(function(e){return e.number!==i}),this.renderMobileList()},addMobile:function(i,e,t){i=this.parseMobileNumber(i),e=this.parseMobileTime(e),t=this.parseMobileTime(t),i&&e&&t&&this.mobileList.push({number:i,fromTime:e,toTime:t})},parseMobileNumber:function(i){return i=i.replace(/[^0-9]/g,""),i.length<9?"":(9===i.length&&(i="48"+i),i.length>11?"":"+"+i)},parseMobileTime:function(i){i.trim().length||(i="00:00"),i>-1&&25>i&&(10>i?i="0"+i+":00":"24"===i?i="00:00":i+=":00");var e=i.match(/([0-9]{1,2})[^0-9]*([0-9]{2})/);return null===e?"00:00":(1===e[1].length&&(e[1]="0"+e[1]),e[1]+":"+e[2])},handleFailure:function(i){var e=i.responseJSON,t=e&&e.error&&e.error.message;return s.has("users","FORM:ERROR:"+t)?this.showErrorMessage(s("users","FORM:ERROR:"+t)):n.prototype.handleFailure.apply(this,arguments)}})});