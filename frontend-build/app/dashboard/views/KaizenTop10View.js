define(["underscore","app/time","app/core/View","app/dashboard/templates/kaizenTop10"],function(t,e,o,n){"use strict";return o.extend({template:n,top10Property:"top10",initialize:function(){this.state=this.getDataState(),"empty"===this.state?(this.listenToOnce(this.model,"request",this.onLoadingStart),this.listenToOnce(this.model,"error",this.onLoadingError),this.listenToOnce(this.model,"sync",this.onLoaded)):this.listenTo(this.model,"change:"+this.options.top10Property,this.render)},getTemplateData:function(){return{state:this.state,month:e.getMoment().add(this.options.month||0,"months").month()+1,top10:this.getData()}},getData:function(){var t=e.getMoment().startOf("month").add(this.options.month||0,"months"),o=t.clone().add(1,"months"),n=this.options.urlTemplate.replace("${from}",t.valueOf()).replace("${to}",o.valueOf());return(this.model.get(this.options.top10Property)||[]).map(function(t){return t.url=n.replace("${user}",t._id),t})},getDataState:function(){return t.isEmpty(this.getData())?"empty":"ready"},onLoadingStart:function(){this.state="loading",this.render()},onLoadingError:function(){this.state=this.getDataState(),this.render()},onLoaded:function(){this.state=this.getDataState(),this.render()}})});