define(["underscore","app/i18n","app/core/View","app/reports/util/formatTooltipHeader","app/suggestions/templates/engagementReport"],function(e,t,s,i,n){"use strict";return s.extend({template:n,initialize:function(){this.listenTo(this.model,"change:groups",this.render)},getTemplateData:function(){return{formatHeader:i.bind(this),groups:this.model.get("groups"),counters:["nearMisses","suggestions","observations","minutes","audits","talks","total"]}}})});