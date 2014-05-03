// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/core/views/ListView"],function(e,t){return t.extend({remoteTopics:{"xiconf.synced":"refreshCollection"},events:{"click tr":function(e){this.broker.publish("router.navigate",{url:this.collection.get(e.currentTarget.dataset.id).genClientUrl(),trigger:!0,replace:!1})}},columns:["srcId","order","nc12","programName","counter","quantity","startedAt","duration"],serializeActions:function(){return null},serializeRow:function(t){var r=t.get("order");return{_id:t.id,className:"xiconf-entry "+("success"===t.get("result")?"success":"danger"),srcId:t.get("srcId"),order:r?r.no:null,programName:t.get("programName"),nc12:t.get("nc12"),counter:t.get("counter"),quantity:r?r.quantity:null,startedAt:e.format(t.get("startedAt"),"YYYY-MM-DD, HH:mm:ss.SSS"),duration:e.toString(t.get("duration")/1e3,!1,!0)}}})});