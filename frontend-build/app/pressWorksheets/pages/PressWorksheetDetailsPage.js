// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/user","app/core/util/pageActions","app/core/pages/DetailsPage","../views/PressWorksheetDetailsView"],function(e,t,i,a){return i.extend({DetailsView:a,actions:function(){var i=288e5,a=Date.now(),s=[];return(e.isAllowedTo("PROD_DATA:MANAGE")||e.data._id===this.model.get("creator").id&&Date.parse(this.model.get("createdAt"))+i>a)&&s.push(t.edit(this.model),t.delete(this.model)),s}})});