define(["../i18n","../core/Model"],function(e,o){"use strict";return o.extend({urlRoot:"/componentLabels",clientUrlRoot:"#componentLabels",topicPrefix:"componentLabels",privilegePrefix:"PROD_DATA",nlsDomain:"componentLabels",getLabel:function(){return this.get("description")||this.get("componentCode")+", "+this.get("operationNo")}},{TEMPLATES:["32x16","104x42"]})});