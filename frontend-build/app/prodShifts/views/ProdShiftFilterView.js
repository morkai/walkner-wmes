// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/user","app/data/prodLines","app/core/views/FilterView","app/core/util/fixTimeRange","app/prodShifts/templates/filter"],function(e,t,i,r,a){return i.extend({template:a,defaultFormData:{createdAt:"",prodLine:null,shift:0},termToForm:{date:function(e,t,i){r.toFormData(i,t,"date")},prodLine:function(e,t,i){i[e]=t.args[1]},shift:"prodLine"},afterRender:function(){i.prototype.afterRender.call(this),this.$id("prodLine").select2({width:"275px",allowClear:!e.getDivision(),data:this.getApplicableProdLines()})},getApplicableProdLines:function(){return t.getForCurrentUser().map(function(e){return{id:e.id,text:e.getLabel()}})},serializeFormToQuery:function(e){var t=r.fromView(this),i=this.$id("prodLine").val(),a=parseInt(this.$("input[name=shift]:checked").val(),10);i&&i.length&&e.push({name:"eq",args:["prodLine",i]}),a&&e.push({name:"eq",args:["shift",a]}),t.from&&e.push({name:"ge",args:["date",t.from]}),t.to&&e.push({name:"le",args:["date",t.to]})}})});