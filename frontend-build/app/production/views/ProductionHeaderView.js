// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/viewport","app/core/View","app/data/prodLog","app/data/views/renderOrgUnitPath","app/users/UserCollection","./PersonelPickerView","app/production/templates/header"],function(e,t,i,r,n,o,s,a){return i.extend({template:a,localTopics:{"visibility.visible":function(){this.updateCurrentTime()},"visibility.hidden":function(){clearTimeout(this.timers.updateCurrentTime)},"divisions.synced":"updateOrgUnit","subdivisions.synced":"updateOrgUnit","mrpControllers.synced":"updateOrgUnit","prodFlows.synced":"updateOrgUnit","workCenters.synced":"updateOrgUnit","prodLines.synced":"updateOrgUnit","socket.connected":"fillPersonnelData"},events:{"click .production-property-master .btn-link":"showMasterPickerDialog","click .production-property-leader .btn-link":"showLeaderPickerDialog","click .production-property-operator .btn-link":"showOperatorPickerDialog"},initialize:function(){this.updateCurrentTime=this.updateCurrentTime.bind(this),this.listenTo(this.model.prodLine,"change:description",this.updatePageHeader),this.listenTo(this.model,"change:shift",this.updateShift),this.listenTo(this.model,"change:master",this.updateMaster),this.listenTo(this.model,"change:leader",this.updateLeader),this.listenTo(this.model,"change:operator",this.updateOperator),this.listenTo(this.model,"locked unlocked",function(){this.updateMaster(),this.updateLeader(),this.updateOperator()})},afterRender:function(){this.$currentTime=this.$property("currentTime"),this.updatePageHeader(),this.updateCurrentTime(),this.updateShift(),this.updateOrgUnit(),this.updateMaster(),this.updateLeader(),this.updateOperator(),this.socket.isConnected()&&this.fillPersonnelData()},updatePageHeader:function(){this.$(".production-pageHeader").text(this.model.prodLine.get("description")||this.model.prodLine.id)},updateCurrentTime:function(){this.$currentTime.text(this.model.getCurrentTime()),this.scheduleCurrentTimeUpdate()},updateShift:function(){var t=this.model.get("shift");t="number"==typeof t?e("core","SHIFT:"+t):"?",this.$property("shift").text(t)},updateOrgUnit:function(){this.$property("orgUnit").text(n(this.model.prodLine.getSubdivision(),!1,!1)||"?")},updateMaster:function(){this.updatePersonnel("master")},updateLeader:function(){this.updatePersonnel("leader")},updateOperator:function(){this.updatePersonnel("operator")},updatePersonnel:function(t){var i,r=!this.model.isLocked(),n=this.model.get(t),o=n&&n.label?n.label:null;if(o){var s=o.match(/^(.*?) \(.*?\)$/);i=null===s?o:s[1].trim(),r&&(i+=' <button class="btn btn-link">'+e("production","property:"+t+":change")+"</button>")}else i=e("production","property:"+t+":noData:"+(r?"un":"")+"locked"),r&&(i='<button class="btn btn-link">'+i+"</a>");this.$property(t).html(i)},scheduleCurrentTimeUpdate:function(){null!=this.timers.updateCurrentTime&&clearTimeout(this.timers.updateCurrentTime),this.timers.updateCurrentTime=setTimeout(function(e){e.timers.updateCurrentTime=null,e.updateCurrentTime()},999,this)},$property:function(e){return this.$(".production-property-"+e+" .production-property-value")},showMasterPickerDialog:function(e){e&&(e.preventDefault(),e.target.blur()),this.showPickerDialog("master",this.model.changeMaster.bind(this.model))},showLeaderPickerDialog:function(e){e&&(e.preventDefault(),e.target.blur()),this.showPickerDialog("leader",this.model.changeLeader.bind(this.model))},showOperatorPickerDialog:function(e){e&&(e.preventDefault(),e.target.blur()),this.showPickerDialog("operator",this.model.changeOperator.bind(this.model))},showPickerDialog:function(i,r){var n=new s;this.listenTo(n,"userPicked",function(e){t.closeDialog();var n=this.model.get(i);null===n?null!==e&&r(e):(n!==e||e&&(e.id!==n.id||e.label!==n.label))&&r(e),this.$(".production-property-"+i+" .btn-link").focus()}),t.showDialog(n,e("production","personelPicker:title:"+i))},fillPersonnelData:function(){var e=[],t=[],i=this.model;["master","leader","operator"].forEach(function(r){var n=i.get(r);n&&null===n.id&&n.label.trim().length>0&&(e.push(n.label),t.push(r))}),e.length>0&&this.fillUserInfo(e,t)},fillUserInfo:function(e,t){if(r.isSyncing())return this.broker.subscribe("production.synced",this.fillPersonnelData.bind(this)).setLimit(1);var i=new o(null,{rqlQuery:{fields:{firstName:1,lastName:1,personellId:1},selector:{name:e.length>1?"in":"eq",args:["personellId",e.length>1?e:e[0]]}}}),n=this.model;this.promised(i.fetch()).then(function(){var r=0;e.forEach(function(e,r){var o=i.findWhere({personellId:e});o&&n.set(t[r],{id:o.id,label:o.get("firstName")+" "+o.get("lastName")})}),r&&n.saveLocalData()})}})});