// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/core/View","app/kanbanPrintQueues/templates/dialog"],function(t,n,e,i){"use strict";return e.extend({dialogClassName:"kanbanPrintQueues-dialog modal-static modal-no-keyboard",initialize:function(){this.current=null,this.remaining=this.buildRemainingQueue(),this.jobTotal=this.remaining.length,this.listenTo(this.model.queue,"change:jobs",this.onJobsChange)},destroy:function(){this.current=null},afterRender:function(){this.current?this.updateJob():this.printNext()},onJobsChange:function(t,n){this.current&&-1!==n.indexOf(this.current.job)&&this.updateJob()},updateJob:function(){this.$el.closest(".kanbanPrintQueues-dialog")[0].dataset.status=this.error?"failure":this.current.job.status,this.el.innerHTML=i({idPrefix:this.idPrefix,workstation:this.current.workstation,job:this.current.job,jobNo:this.jobTotal-this.remaining.length,jobTotal:this.jobTotal,error:this.error})},printNext:function(){var e=this;e.current=e.remaining.shift(),e.error=null,e.updateJob();var i=t.ajax({method:"POST",url:"/kanban/printQueues;print",data:JSON.stringify({queue:e.model.queue.id,job:e.current.job._id,workstation:e.current.workstation,infoLabels:e.current.infoLabels})});i.fail(function(){if(e.current){var t=i.responseJSON&&i.responseJSON.error&&i.responseJSON.error.code;i.status?n.has("kanbanPrintQueues","msg:print:"+t)||(t="failure"):t="CONNECTION",e.error=n("kanbanPrintQueues","msg:print:"+t),e.updateJob()}}),i.done(function(){e.current&&(e.remaining.length?e.timers.printNext=setTimeout(e.printNext.bind(e),1):e.unlock())})},unlock:function(){this.$el.closest(".modal").removeClass("modal-static modal-no-keyboard"),this.timers.hide=setTimeout(this.closeDialog,5e3)},closeDialog:function(){},onDialogShown:function(t){this.closeDialog=t.closeDialog.bind(t)},buildRemainingQueue:function(){if(!this.model.groupByWorkstations)return this.model.jobs.map(function(t){return{job:t,workstation:null,infoLabels:[]}});var t={};this.model.jobs.forEach(function(n){var e=t[n.line];e||(e=t[n.line]={});for(var i=0;i<6;++i)n.data.workstations[i]&&(e[i]||(e[i]=[]),e[i].push(n))});var n=[];return Object.keys(t).forEach(function(e){Object.keys(t[e]).sort().reverse().forEach(function(i){var o=t[e][i],r={};o.forEach(function(t){t.layouts.forEach(function(t){r[t]=1})});var s=o.length-1;o.forEach(function(t,e){n.push({job:t,workstation:+i,infoLabels:e===s?Object.keys(r):[]})})})}),n}})});