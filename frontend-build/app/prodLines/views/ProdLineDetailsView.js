define(["app/orgUnits/util/renderOrgUnitPath","app/core/views/DetailsView","app/prodLines/templates/details"],function(e,r,i){"use strict";return r.extend({template:i,localTopics:{"divisions.synced":"render","subdivisions.synced":"render","mrpControllers.synced":"render","prodFlows.synced":"render"},serializeDetails:function(){var r=this.model.toJSON();return r.orgUnitPath=e(this.model,!0),r}})});