define(["underscore","app/data/loadedModules","app/core/views/DetailsView","app/users/templates/details"],function(e,s,t,a){"use strict";return t.extend({template:a,localTopics:{"companies.synced":"render","aors.synced":"render"},serialize:function(){return e.extend(t.prototype.serialize.call(this),{loadedModules:s})}})});