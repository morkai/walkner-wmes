define(["app/data/views/renderOrgUnitPath","app/core/views/DetailsView","app/subdivisions/templates/details"],function(e,i,t){return i.extend({template:t,localTopics:{"divisions.synced":"render"},serialize:function(){var t=i.prototype.serialize.call(this);return t.orgUnitPath=e(this.model,!0),t}})});