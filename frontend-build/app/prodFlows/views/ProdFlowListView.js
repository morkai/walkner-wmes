define(["app/data/views/renderOrgUnitPath","app/core/views/ListView","./decorateProdFlow"],function(e,n,i){return n.extend({columns:["subdivision","mrpControllers","name"],serializeRows:function(){return this.collection.map(function(e){return i(e,!0)})}})});