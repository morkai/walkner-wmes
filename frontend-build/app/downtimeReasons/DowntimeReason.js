define(["../core/Model"],function(e){return e.extend({urlRoot:"/downtimeReasons",clientUrlRoot:"#downtimeReasons",topicPrefix:"downtimeReasons",privilegePrefix:"DICTIONARIES",nlsDomain:"downtimeReasons",labelAttribute:"label",defaults:{label:null,pressPosition:-1,report1:!0},toJSON:function(){var o=e.prototype.toJSON.call(this);return o.label||(o.label=o._id),o}})});