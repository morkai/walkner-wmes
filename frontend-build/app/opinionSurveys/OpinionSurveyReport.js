define(["underscore","../core/Model"],function(e,r){"use strict";return r.extend({urlRoot:"/opinionSurveys/report",initialize:function(e,r){if(!r.query)throw new Error("query option is required!");this.query=r.query},genClientUrl:function(){return"/opinionSurveyReport?"+this.query.serializeToString()},fetch:function(t){return e.isObject(t)||(t={}),t.data=e.extend(t.data||{},this.query.serializeToObject()),r.prototype.fetch.call(this,t)}})});