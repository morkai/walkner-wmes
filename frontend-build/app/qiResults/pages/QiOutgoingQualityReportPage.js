define(["underscore","app/i18n","app/core/View","app/core/util/bindLoadingMessage","app/data/orgUnits","app/reports/util/formatTooltipHeader","../dictionaries","../QiOutgoingQualityReport","../views/outgoingQuality/FilterView","../views/outgoingQuality/PpmChartView","../views/outgoingQuality/PpmTableView","../views/outgoingQuality/ParetoChartView","../views/outgoingQuality/ParetoTableView","app/qiResults/templates/outgoingQuality/page"],function(e,t,i,r,o,a,n,l,s,p,u,h,w,g){"use strict";return i.extend({layoutName:"page",template:g,breadcrumbs:function(){return[this.t("BREADCRUMBS:base"),this.t("BREADCRUMBS:reports:outgoingQuality")]},initialize:function(){var e=r(this.model,this);function t(e){var t=o.getByTypeAndId("mrpController",e);return t?t.get("description"):""}function i(e,t){var i=n.faults.get(e);if(!i)return"";var r=i.get("name"),o=i.get("description");return t||r===o?r:r+":\n"+o}this.setView("#-filter",new s({model:e})),this.setView("#-ppm-chart",new p({model:e})),this.setView("#-ppm-table",new u({model:e})),this.setView("#-where-chart",new h({model:e,property:"where",resolveTitle:t})),this.setView("#-where-table",new w({model:e,property:"where",resolveTitle:t})),this.setView("#-what-chart",new h({model:e,property:"what",resolveTitle:i})),this.setView("#-what-table",new w({model:e,property:"what",resolveTitle:i})),this.listenTo(e,"filtered",this.onFiltered)},load:function(e){return e(this.model.fetch())},onFiltered:function(){this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})}})});