// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model","../data/workCenters"],function(e,i){return e.extend({urlRoot:"/prodLines",clientUrlRoot:"#prodLines",topicPrefix:"prodLines",privilegePrefix:"DICTIONARIES",nlsDomain:"prodLines",labelAttribute:"_id",defaults:{workCenter:null,description:null},getSubdivision:function(){var e=i.get(this.get("workCenter"));return e?e.getSubdivision():null}})});