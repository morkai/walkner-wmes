define(["../core/Model","../data/workCenters"],function(e,t){return e.extend({urlRoot:"/prodLines",clientUrlRoot:"#prodLines",topicPrefix:"prodLines",privilegePrefix:"DICTIONARIES",nlsDomain:"prodLines",labelAttribute:"_id",defaults:{workCenter:null,description:null},getSubdivision:function(){var e=t.get(this.get("workCenter"));return e?e.getSubdivision():null}})});