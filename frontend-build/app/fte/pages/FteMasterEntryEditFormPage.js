define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../FteMasterEntry","../views/FteMasterEntryEditFormView"],function(e,t,i,r,n){"use strict";return i.extend({layoutName:"page",pageId:"fteMasterEntryForm",pageClassName:"page-max-flex",breadcrumbs:function(){return[{label:e.bound("fte","BREADCRUMB:master:browse"),href:this.model.genClientUrl("base")},{label:e.bound("fte","BREADCRUMB:details"),href:this.model.genClientUrl()},e.bound("fte","BREADCRUMB:editForm")]},initialize:function(){this.model=t(this.model||new r({_id:this.options.modelId}),this),this.view=new n({model:this.model}),this.listenTo(this.view,"remoteError",function(e){"AUTH"===e.message&&this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!0,replace:!0})})},load:function(e){return e(this.model.fetch())}})});