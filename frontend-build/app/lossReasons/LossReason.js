define(["../core/Model"],function(e){return e.extend({urlRoot:"/lossReasons",clientUrlRoot:"#lossReasons",topicPrefix:"lossReasons",privilegePrefix:"DICTIONARIES",nlsDomain:"lossReasons",labelAttribute:"label",defaults:{label:null,position:0},toJSON:function(){var t=e.prototype.toJSON.call(this);return t.label||(t.label=t._id),t}})});