define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/data/localStorage","app/core/View","app/core/util/getShiftStartInfo","app/core/util/embedded","app/production/snManager","./UnlockDialogView","app/heff/templates/page"],function(t,e,i,a,o,n,d,s,r,h,l,f,p){"use strict";var u=[2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1];return s.extend({template:p,remoteTopics:function(){var t={};return this.model.prodLine&&(t["heff.reload."+this.model.prodLine]="onReload"),t},localTopics:{"socket.connected":"loadData"},events:{"click #-line":function(){var t=new f({model:this.model});n.showDialog(t,this.t("unlockDialog:title"))},"click #-snMessage":"hideSnMessage"},initialize:function(){this.periodicUpdate=this.periodicUpdate.bind(this),this.loadData=this.loadData.bind(this),this.currentHour=-1,this.shiftStartInfo=null,l.bind(this)},destroy:function(){e(window).off("."+this.idPrefix)},afterRender:function(){this.updateLine(),this.periodicUpdate(),this.loadData(),h.render(this),h.ready(),this.model.prodLine||this.$id("line").click()},loadData:function(){var t=this;if(t.model.prodLine){var e="/heff/"+encodeURIComponent(t.model.prodLine);clearTimeout(t.timers.loadData),t.ajax({url:e}).done(function(e){t.updateData(e),t.timers.loadData=setTimeout(t.loadData,3e5)})}},periodicUpdate:function(){var t=a.getMoment(),e=t.hours();this.updateDate(t),e!==this.currentHour&&(this.currentHour=e,this.hourlyUpdate(t)),this.timers.periodicUpdate=setTimeout(this.periodicUpdate,1e3)},hourlyUpdate:function(t){this.updateShift(t),this.updateTitle(t)},updateDate:function(t){this.$id("date").html(t.format("dddd, LL<br>LTS"))},updateShift:function(t){this.shiftStartInfo=r(t.valueOf());var e=i("core","SHIFT:"+this.shiftStartInfo.no);this.$id("shift").html(i("heff","shift",{shift:e}))},updateLine:function(){var t="?";this.model.prodLine&&(t=this.model.prodLine,this.model.station&&(t=this.t("station",{line:t,station:this.model.station}))),this.$id("line").text(t)},updateTitle:function(t){this.$id("title").html(i("heff","title",{from:this.shiftStartInfo.moment.format("H:00"),to:t.clone().add(1,"hours").format("H:00")}))},updateData:function(t){if(Array.isArray(t)&&8===t.length){for(var e=a.getMoment(),i=e.hours(),o=u[i],n=e.minutes(),d=0,s=0,r=0,h=0,l=0;l<8;++l){var f=t[l].planned;r+=f,h+=t[l].actual,l<o?(d+=f,s+=f):l===o&&(s+=f,d+=Math.round(f*(n/60)*1e3)/1e3)}this.$id("planned").text(s),this.$id("actual").text(h),this.$id("remaining").text(Math.max(r-h,0)),this.$id("eff").removeClass("fa-smile-o fa-frown-o fa-meh-o").addClass(h>=d?"fa-smile-o":"fa-frown-o")}},onReload:function(t){this.updateData(t.quantitiesDone)}})});