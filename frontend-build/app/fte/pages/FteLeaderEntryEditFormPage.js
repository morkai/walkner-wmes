define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../FteLeaderEntry","../views/FteLeaderEntryEditFormView"],function(e,t,i,r,n){"use strict";return i.extend({layoutName:"page",pageId:"fteLeaderEntryForm",breadcrumbs:function(){return[{label:e.bound("fte","BREADCRUMBS:"+this.model.TYPE+":browse"),href:this.model.genClientUrl("base")},{label:e.bound("fte","BREADCRUMBS:details"),href:this.model.genClientUrl()},e.bound("fte","BREADCRUMBS:editForm")]},initialize:function(){this.model=t(this.model,this),this.view=new n({model:this.model}),this.listenTo(this.view,"remoteError",function(e){"AUTH"===e.message&&this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!0,replace:!0})})},load:function(e){return e(this.model.fetch())}})});