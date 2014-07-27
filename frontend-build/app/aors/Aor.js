// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Model","app/core/templates/colorLabel"],function(e,o){return e.extend({urlRoot:"/aors",clientUrlRoot:"#aors",topicPrefix:"aors",privilegePrefix:"DICTIONARIES",nlsDomain:"aors",labelAttribute:"name",defaults:{name:null,description:null,color:"#f08f44",refColor:"#ffa85c",refValue:0},serialize:function(){var e=this.toJSON();return e.color=o({color:e.color}),e.refColor=o({color:e.refColor}),e.refValue=e.refValue&&e.refValue.toLocaleString?e.refValue.toLocaleString():"0",e}})});