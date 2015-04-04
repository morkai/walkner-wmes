// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model","app/data/subdivisions"],function(e,i){"use strict";return e.extend({urlRoot:"/mrpControllers",clientUrlRoot:"#mrpControllers",topicPrefix:"mrpControllers",privilegePrefix:"DICTIONARIES",nlsDomain:"mrpControllers",labelAttribute:"_id",defaults:{subdivision:null,description:null,deactivatedAt:null,replacedBy:null},getSubdivision:function(){return i.get(this.get("subdivision"))||null}})});