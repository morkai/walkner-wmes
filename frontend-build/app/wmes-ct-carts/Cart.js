define(["../i18n","../core/Model"],function(t,e){"use strict";return e.extend({urlRoot:"/ct/carts",clientUrlRoot:"#ct/carts",topicPrefix:"ct.carts",privilegePrefix:"PROD_DATA",nlsDomain:"wmes-ct-carts",labelAttribute:"description",defaults:{type:"other"},serialize:function(){var e=this.toJSON();return e.type=t(this.nlsDomain,"type:"+e.type),e.cards=e.cards.join(" "),e}})});