// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/user","app/core/util/pageActions","app/core/pages/DetailsPage","../views/decoratePressWorksheet","app/pressWorksheets/templates/details"],function(e,t,s,a,i){return s.extend({detailsTemplate:i,serializeDetails:a,actions:function(){var s=288e5,a=Date.now(),i=[];return(e.isAllowedTo("PROD_DATA:MANAGE")||e.data._id===this.model.get("creator").id&&Date.parse(this.model.get("createdAt"))+s>a)&&i.push(t.edit(this.model),t.delete(this.model)),i}})});