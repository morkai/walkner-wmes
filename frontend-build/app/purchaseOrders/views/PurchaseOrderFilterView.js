// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/user","app/core/views/FilterView","app/core/util/fixTimeRange","app/vendors/util/setUpVendorSelect2","app/purchaseOrders/templates/filter"],function(e,t,r,s,a){return t.extend({template:a,defaultFormData:{_id:"",vendor:"","items.nc12":"",from:"",to:"",status:["open","closed"]},termToForm:{_id:function(e,t,r){r[e]="string"==typeof t.args[1]?t.args[1].replace(/[^0-9]+/g,""):""},vendor:function(e,t,r){r.vendor=t.args[1]},open:function(e,t,r){r.status=[t.args[1]?"open":"closed"]},"items.schedule.date":function(e,t,s){r.toFormData(s,t,"date")},"items.nc12":"_id"},afterRender:function(){if(t.prototype.afterRender.call(this),!e.data.vendor){var r=this.$id("vendor").val();r&&(r={id:r,text:r}),s(this.$id("vendor"),{width:250}).select2("data",r)}this.toggleButtonGroup("status")},serializeFormToQuery:function(e){var t=r.fromView(this),s=this.getStatus(),a=this.$id("vendor").val();a&&e.push({name:"eq",args:["vendor",a]}),t.from&&e.push({name:"ge",args:["items.schedule.date",t.from]}),t.to&&e.push({name:"le",args:["items.schedule.date",t.to]}),null!==s&&e.push({name:"eq",args:["open",s]}),this.serializeRegexTerm(e,"_id",6),this.serializeRegexTerm(e,"items.nc12",12)},getStatus:function(){var e=this.$('[name="status[]"]'),t=e.filter(":checked");return 0===t.length&&(t=e.prop("checked",!0),this.toggleButtonGroup("status")),2===t.length?null:"open"===t[0].value}})});