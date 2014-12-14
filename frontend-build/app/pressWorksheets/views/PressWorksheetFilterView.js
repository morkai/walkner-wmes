// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/data/divisions","app/core/views/FilterView","app/users/util/setUpUserSelect2","app/pressWorksheets/templates/filter"],function(e,t,i,s,r){return i.extend({template:r,defaultFormData:function(){return{date:"",shift:0,type:"any",divisions:t.filter(function(e){return"prod"===e.get("type")}).map(function(e){return e.id}),mine:!1,userType:"operators",user:{id:null,text:null}}},termToForm:{date:function(t,i,s){if("in"===i.name)s.date=e.format(i.args[1][0],"YYYY-MM-DD");else{var r=e.getMoment(i.args[1]);s.date=r.format("YYYY-MM-DD"),s.shift=this.getShiftNoFromMoment(r)}},shift:function(e,t,i){i[e]=t.args[1]},divisions:function(e,t,i){i.divisions="in"===t.name?t.args[1]:[t.args[1]]},"master.id":function(e,t,i){i.userType=e.split(".")[0],i.user.id=t.args[1],null===i.user.text&&(i.user.text=t.args[1])},user:function(e,t,i){i.user.text=t.args[1]},type:"shift",mine:"shift","operator.id":"master.id","operators.id":"master.id"},serialize:function(){var e=i.prototype.serialize.call(this);return e.divisions=t.filter(function(e){return"prod"===e.get("type")}).sort(function(e,t){return e.getLabel().localeCompare(t.getLabel())}).map(function(e){return{id:e.id,label:e.id,title:e.get("description")}}),e},afterRender:function(){i.prototype.afterRender.call(this),this.toggleButtonGroup("shift"),this.toggleButtonGroup("type"),this.toggleButtonGroup("divisions"),this.toggleButtonGroup("mine"),s(this.$id("user")).select2("data",null===this.formData.user.id?null:this.formData.user)},serializeFormToQuery:function(t,i){var s=e.getMoment(this.$id("date").val()),r=parseInt(this.$("input[name=shift]:checked").val(),10),n=this.$("input[name=type]:checked").val(),a=this.getButtonGroupValue("divisions"),o=this.$("input[name=mine]:checked").val(),u=this.$("input[name=userType]:checked").val(),p=this.$id("user").select2("data");if(this.setHoursByShiftNo(s,r),s.isValid())if(0===r){var l=s.valueOf();t.push({name:"in",args:["date",[l+216e5,l+504e5,l+792e5]]})}else t.push({name:"eq",args:["date",s.valueOf()]});else 0!==r&&t.push({name:"eq",args:["shift",r]});"any"!==n&&t.push({name:"eq",args:["type",n]}),1===a.length?t.push({name:"eq",args:["divisions",a[0]]}):a.length>1&&t.push({name:"in",args:["divisions",a]}),p&&(t.push({name:"eq",args:[u+".id",p.id]}),t.push({name:"eq",args:["user",p.text]})),o?(t.push({name:"eq",args:["mine",1]}),i.sort={createdAt:-1}):i.sort={date:-1}},getShiftNoFromMoment:function(e){var t=e.hours();return 6===t?1:14===t?2:22===t?3:0},setHoursByShiftNo:function(e,t){e.hours(1===t?6:2===t?14:3===t?22:0)}})});