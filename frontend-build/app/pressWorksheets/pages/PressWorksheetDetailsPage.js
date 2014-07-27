// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/user","app/core/util/pageActions","app/core/pages/DetailsPage","app/pressWorksheets/templates/details"],function(e,t,a,s){return a.extend({detailsTemplate:s,actions:function(){var a=288e5,s=Date.now(),i=[];return(e.isAllowedTo("PROD_DATA:MANAGE")||e.data._id===this.model.get("creator").id&&Date.parse(this.model.get("createdAt"))+a>s)&&i.push(t.edit(this.model),t.delete(this.model)),i}})});