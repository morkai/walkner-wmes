define(["app/core/views/FormView","app/core/util/idAndLabel","app/users/util/setUpUserSelect2","app/wmes-osh-common/dictionaries","app/wmes-osh-divisions/templates/form"],function(e,t,r,o,s){"use strict";return e.extend({template:s,afterRender:function(){e.prototype.afterRender.apply(this,arguments),this.setUpWorkplaceSelect2(),this.setUpManagerSelect2(),this.setUpCoordinatorsSelect2()},setUpWorkplaceSelect2:function(){this.$id("workplace").select2({width:"100%",data:o.workplaces.map(e=>({id:e.id,text:e.getLabel({long:!0})}))})},setUpManagerSelect2:function(){r(this.$id("manager"),{currentUserInfo:this.model.get("manager")})},setUpCoordinatorsSelect2:function(){r(this.$id("coordinators"),{multiple:!0,allowClear:!0,currentUserInfo:this.model.get("coordinators")})},serializeForm:function(e){return e.manager=r.getUserInfo(this.$id("manager")),e.coordinators=r.getUserInfo(this.$id("coordinators")),e.syncPatterns||(e.syncPatterns=""),e}})});