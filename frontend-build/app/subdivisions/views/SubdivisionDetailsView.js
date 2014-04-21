// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/DetailsView","./decorateSubdivision","app/subdivisions/templates/details"],function(e,i,s){return e.extend({template:s,localTopics:{"divisions.synced":"render"},serialize:function(){return{model:i(this.model)}}})});