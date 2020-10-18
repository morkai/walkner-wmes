define(["jquery","app/viewport","app/core/View","app/core/pages/createPageBreadcrumbs","app/core/util/pageActions","app/core/util/bindLoadingMessage","app/core/util/onModelDeleted","../dictionaries","../views/PropsView","../views/AttachmentsView","../views/HistoryView","app/wmes-osh-common/templates/details/page"],function(e,t,i,s,o,n,d,l,a,h,r,c){"use strict";return i.extend({template:c,remoteTopics:function(){const e=this.model.getTopicPrefix();return{[`${e}.updated.${this.model.id}`]:"onModelUpdated",[`${e}.deleted`]:"onModelDeleted"}},localTopics:function(){return{[`${this.model.getTopicPrefix()}.seen.*`]:"onSeen"}},breadcrumbs:function(){return s(this,[this.model.getLabel()])},actions:function(){const e=[o.edit(this.model),o.delete(this.model)];return this.model.getObserver().notify&&e.unshift({icon:"eye",label:this.t("wmes-osh-common","markAsSeen:pageAction:details"),callback:this.markAsSeen.bind(this)}),e},initialize:function(){l.bind(this),this.defineModels(),this.defineViews(),this.defineBindings()},getPropsViewClass:function(){return this.PropsView||a},getPropsViewOptions:function(){var e={model:this.model};return"function"==typeof this.propsTemplate&&(e.template=this.propsTemplate),e},defineModels:function(){this.model=n(this.model,this)},defineViews:function(){this.propsView=new(this.getPropsViewClass())(this.getPropsViewOptions()),this.attachmentsView=new h({model:this.model}),this.historyView=new r({model:this.model}),this.setView("#-props",this.propsView),this.setView("#-attachments",this.attachmentsView),this.setView("#-history",this.historyView)},defineBindings:function(){this.once("afterRender",()=>{this.listenTo(this.model,"change",this.onModelChanged)})},load:function(e){return e(this.model.fetch())},setUpLayout:function(e){this.layout=e},onModelUpdated:function(e){this.model.handleUpdate(e.change,e.notify)},onModelChanged:function(){this.layout&&this.layout.setActions(this.actions,this)},onModelDeleted:function(e){d(this.broker,this.model,e)},onSeen:function({ids:e}){e.includes(this.model.id)&&this.model.handleSeen()},markAsSeen:function(i){const s=e(i?i.target:null).closest(".btn").prop("disabled",!0);this.ajax({method:"POST",url:`${this.model.genUrl("mark-as-seen",!0)}`,data:JSON.stringify({filter:[this.model.id]})}).fail(()=>{t.msg.show({type:"error",time:2e3,text:this.t("wmes-osh-common","markAsSeen:failure")}),s.prop("disabled",!1)})}})});