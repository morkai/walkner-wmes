define(["underscore","jquery","app/i18n","app/viewport","app/data/aors","app/data/downtimeReasons","app/core/View","app/production/templates/downtimePicker"],function(e,t,i,n,o,s,r,a){return r.extend({template:a,dialogClassName:"production-modal",events:{"keypress .select2-container":function(e){13===e.which&&(e.preventDefault(),this.$el.submit())},"keypress textarea":function(e){13===e.which&&""===e.target.value.trim()&&(e.preventDefault(),this.$el.submit())},submit:function(e){e.preventDefault();var t=this.$(".btn-danger")[0];t.disabled||(t.disabled=!0,this.handlePick(t))}},initialize:function(){this.idPrefix=e.uniqueId("downtimePicker")},serialize:function(){return{idPrefix:this.idPrefix}},afterRender:function(){this.setUpReasonSelect2(),this.setUpAorSelect2(),this.$id("reason").select2("focus")},onDialogShown:function(){this.$id("reason").select2("focus")},setUpReasonSelect2:function(){var e=this,t=this.$id("reason");t.select2({dropdownCssClass:"production-dropdown",openOnEnter:null,data:s.filter(function(e){return-1===e.get("pressPosition")}).map(function(e){return{id:e.id,text:e.id+" - "+e.get("label")}}).sort(function(e,t){return e.id.localeCompare(t.id)})}),t.on("change",function(){t.select2("val")&&e.$id("aor").select2("focus")})},setUpAorSelect2:function(){var e=this,t=this.$id("aor");t.select2({dropdownCssClass:"production-dropdown",openOnEnter:null,data:o.map(function(e){return{id:e.id,text:e.get("name")}})}),t.on("change",function(){t.select2("val")&&e.$id("reasonComment").select()})},handlePick:function(e){var t=this.$id("reason").select2("val"),o=this.$id("aor").select2("val"),s=this.$id("reasonComment").val();return t?o?(this.trigger("downtimePicked",{reason:t,reasonComment:s,aor:o}),void 0):(this.$id("aor").select2("focus"),e.disabled=!1,n.msg.show({type:"error",time:2e3,text:i("production","downtimePicker:msg:emptyAor")})):(this.$id("reason").select2("focus"),e.disabled=!1,n.msg.show({type:"error",time:2e3,text:i("production","downtimePicker:msg:emptyReason")}))}})});