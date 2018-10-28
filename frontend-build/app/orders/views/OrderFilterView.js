define(["underscore","app/core/util/fixTimeRange","app/core/util/idAndLabel","app/core/views/FilterView","app/data/orderStatuses","app/mrpControllers/util/setUpMrpSelect2","app/orders/templates/filter"],function(t,e,s,a,i,r,n){"use strict";return a.extend({template:n,defaultFormData:{_id:"",nc12:"",from:"",to:"",mrp:"",statuses:""},termToForm:{scheduledStartDate:function(t,s,a){e.toFormData(a,s,"date")},_id:function(t,e,s){var a=e.args[1];s[t]="string"==typeof a?a.replace(/[^0-9]/g,""):"-"},mrp:function(t,e,s){s[t]=e.args[1].join(",")},statuses:function(t,e,s){s["all"===e.name?"statusesIn":"statusesNin"]=e.args[1].join(",")},nc12:"_id"},afterRender:function(){a.prototype.afterRender.call(this),r(this.$id("mrp"),{own:!0,view:this}),this.$id("statusesIn").select2({width:"200px",multiple:!0,data:i.map(s)}),this.$id("statusesNin").select2({width:"200px",multiple:!0,data:i.map(s)})},serializeFormToQuery:function(t){var s=e.fromView(this),a=this.$id("mrp").val(),i=this.$id("statusesIn").val(),r=this.$id("statusesNin").val();this.serializeRegexTerm(t,"_id",9,null,!1,!0),this.serializeRegexTerm(t,"nc12",12,null,!1,!0),s.from&&t.push({name:"ge",args:["scheduledStartDate",s.from]}),s.to&&t.push({name:"lt",args:["scheduledStartDate",s.to]}),a.length&&t.push({name:"in",args:["mrp",a.split(",")]}),i.length&&t.push({name:"all",args:["statuses",i.split(",")]}),r.length&&t.push({name:"nin",args:["statuses",r.split(",")]})}})});