// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model"],function(e){return e.extend({urlRoot:"/downtimeReasons",clientUrlRoot:"#downtimeReasons",topicPrefix:"downtimeReasons",privilegePrefix:"DICTIONARIES",nlsDomain:"downtimeReasons",labelAttribute:"label",defaults:function(){return{label:null,type:"other",subdivisionTypes:["assembly","press"],opticsPosition:-1,pressPosition:-1,auto:!1,scheduled:!1}}})});