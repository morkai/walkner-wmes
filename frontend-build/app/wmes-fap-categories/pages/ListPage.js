define(["underscore","app/core/util/bindLoadingMessage","app/core/pages/ListPage","../storage"],function(e,s,t,i){"use strict";return t.extend({baseBreadcrumb:"#fap/entries",columns:[{id:"name",className:"is-min"},{id:"active",className:"is-min"},{id:"etoCategory",className:"is-min"},{id:"planners",className:"is-min"},"-"],destroy:function(){t.prototype.destroy.apply(this,arguments),i.release()},load:function(e){return e(this.collection.isEmpty()?this.collection.fetch({reset:!0}):null)},afterRender:function(){t.prototype.afterRender.apply(this,arguments),i.acquire()}})});