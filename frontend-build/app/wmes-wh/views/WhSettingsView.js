define(["underscore","app/user","app/core/util/idAndLabel","app/mrpControllers/util/setUpMrpSelect2","app/users/util/setUpUserSelect2","app/settings/views/SettingsView","../WhUser","app/wh/templates/settings"],function(e,t,n,i,s,r,a,d){"use strict";return r.extend({clientUrl:"#wh-next/settings",template:d,events:e.assign({"change input[data-setting]":function(e){this.updateSetting(e.target.name,e.target.value)},"change input[data-user-func]":function(e){var t=e.currentTarget.dataset.userFunc;e.added?this.addUser(e.added,t):e.removed&&this.removeUser(e.removed,t)},"dblclick .select2-search-choice > div":function(e){if(t.isAllowedTo("USERS:VIEW")){var n=e.currentTarget.textContent.trim(),i=this.whUsers.find(function(e){return e.get("label")===n});i&&window.open("/#users/"+i.id)}}},r.prototype.events),initialize:function(){r.prototype.initialize.apply(this,arguments),this.listenTo(this.whUsers,"add remove",this.onUserUpdated),this.listenTo(this.whUsers,"change:func",this.onFuncChanged)},afterRender:function(){var e=this;r.prototype.afterRender.apply(e,arguments),i(e.$id("planning-ignoredMrps"),{width:"100%",placeholder:" ",sortable:!0,own:!1,view:this}),this.$("input[data-user-func]").each(function(){s(e.$(this),{width:"100%",multiple:!0,allowClear:!0,placeholder:" ",noPersonnelId:!0}),e.updateUsers(this.dataset.userFunc)})},toggleTabPrivileges:function(){this.$(".list-group-item[data-privileges]").each(function(){for(var e=this.dataset.privileges.split(","),n=0;n<e.length;++n)t.isAllowedTo(e[n])||this.classList.add("disabled")})},shouldAutoUpdateSettingField:function(e){return"wh.planning.ignoredMrps"!==e.id},updateSettingField:function(e){e&&"wh.planning.ignoredMrps"===e.id&&this.$id("planning-ignoredMrps").select2("data",e.getValue().map(function(e){return{id:e,text:e}}))},addUser:function(e,t){var n=this,i=n.whUsers.get(e.id);if(i){if(i.get("func")===t)return;this.promised(i.save({func:t}))}else(i=new a({_id:e.id,label:e.text,func:t})).id=null,n.promised(i.save()).done(function(){n.whUsers.add(i)})},removeUser:function(e,t){var n=this.whUsers.get(e.id);n&&n.get("func")===t&&n.destroy()},updateUsers:function(e){this.$('input[data-user-func="'+e+'"]').select2("data",this.whUsers.filter(function(t){return t.get("func")===e}).map(n))},onUserUpdated:function(e){this.updateUsers(e.get("func"))},onFuncChanged:function(e){e.hasChanged("func")&&(this.updateUsers(e.previous("func")),this.updateUsers(e.get("func")))}})});