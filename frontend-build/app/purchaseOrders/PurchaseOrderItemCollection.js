// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../core/Collection","./PurchaseOrderItem"],function(e,t){return e.extend({model:t,comparator:"_id",getMinScheduleDate:function(){var e=new Date;e.setUTCHours(0),e.setUTCMinutes(0),e.setUTCSeconds(0),e.setUTCMilliseconds(0),e=e.getTime();for(var t=1/0,r=0,n=this.length;n>r;++r){var o=this.models[r];if(!o.get("completed"))for(var s=o.get("schedule"),a=0,i=s.length;i>a;++a){var l=Date.parse(s[a].date);t>l&&(t=l)}}return 1/0===t?null:new Date(t)}})});