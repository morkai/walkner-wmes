define(["jquery","app/core/views/FormView","app/core/util/idAndLabel","app/data/prodFunctions","app/users/util/setUpUserSelect2","app/wmes-fap-entries/templates/quickUsersForm"],function(e,t,s,r,i,n){"use strict";return t.extend({template:n,nlsDomain:"wmes-fap-entries",afterRender:function(){t.prototype.afterRender.apply(this,arguments),this.$id("funcs").select2({width:"100%",multiple:!0,data:r.map(s)}),i(this.$id("users"),{view:this,multiple:!0,currentUserInfo:this.model.get("users")})},serializeToForm:function(){const e=this.model.toJSON();return e.funcs=e.funcs.join(","),e.users="",e},serializeForm:function(e){return e.funcs=(e.funcs||"").split(",").filter(e=>!!e),e.users=i.getUserInfo(this.$id("users")),e},request:function(t){return this.model.set(t),e.Deferred().resolve()},handleSuccess:function(){this.trigger("save",this.model.toJSON())}})});