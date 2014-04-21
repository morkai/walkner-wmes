// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model","app/data/mrpControllers","app/data/prodFlows"],function(e,r,t){return e.extend({urlRoot:"/workCenters",clientUrlRoot:"#workCenters",topicPrefix:"workCenters",privilegePrefix:"DICTIONARIES",nlsDomain:"workCenters",labelAttribute:"_id",defaults:{mrpController:null,prodFlow:null,description:null},getSubdivision:function(){var e;if(this.get("mrpController"))e=r.get(this.get("mrpController"));else{var o=t.get(this.get("prodFlow"));o&&(e=r.get((o.get("mrpController")||[])[0]))}return e?e.getSubdivision():null}})});