define(["underscore","backbone"],function(t,e){return e.Model.extend({idAttribute:"_id",urlRoot:"/",clientUrlRoot:null,topicPrefix:null,privilegePrefix:null,nlsDomain:null,labelAttribute:null,genClientUrl:function(t){if(null===this.clientUrlRoot)throw new Error("`clientUrlRoot` was not specified");var e=this.clientUrlRoot;return"base"===t?e:(e+="/",e+=encodeURIComponent(this.isNew()?this.cid:this.id),"string"==typeof t&&(e+=";"+t),e)},getTopicPrefix:function(){return this.topicPrefix},getPrivilegePrefix:function(){return this.privilegePrefix},getNlsDomain:function(){return this.nlsDomain||"core"},getLabelAttribute:function(){return this.labelAttribute||this.idAttribute},getLabel:function(){return String(this.get(this.getLabelAttribute()))}})});