define(["../core/Model"],function(e){return e.extend({urlRoot:"/prodFunctions",clientUrlRoot:"#prodFunctions",topicPrefix:"prodFunctions",privilegePrefix:"DICTIONARIES",nlsDomain:"prodFunctions",labelAttribute:"label",defaults:function(){return{label:"",fteMasterPosition:-1,direct:!1,companies:[]}},toJSON:function(){var t=e.prototype.toJSON.call(this);return t.label||(t.label=t._id),t}})});