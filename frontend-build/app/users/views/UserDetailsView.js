define(["underscore","app/data/loadedModules","app/core/views/DetailsView","app/users/templates/details"],function(e,t,r,a){"use strict";return r.extend({template:a,localTopics:{"companies.synced":"render","aors.synced":"render"},serialize:function(){return e.extend(r.prototype.serialize.call(this),{loadedModules:t})},afterRender:function(){r.prototype.afterRender.call(this)}})});