// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Model","app/data/mrpControllers","app/data/prodFlows"],function(e,t,r){"use strict";return e.extend({urlRoot:"/workCenters",clientUrlRoot:"#workCenters",topicPrefix:"workCenters",privilegePrefix:"DICTIONARIES",nlsDomain:"workCenters",labelAttribute:"_id",defaults:{mrpController:null,prodFlow:null,description:null,deactivatedAt:null},getSubdivision:function(){var e;if(this.get("mrpController"))e=t.get(this.get("mrpController"));else{var l=r.get(this.get("prodFlow"));l&&(e=t.get((l.get("mrpController")||[])[0]))}return e?e.getSubdivision():null}})});