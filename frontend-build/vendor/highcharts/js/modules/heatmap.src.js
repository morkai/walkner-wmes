!function(e){var t=e.seriesTypes,n=e.each;t.heatmap=e.extendClass(t.map,{useMapGeometry:!1,pointArrayMap:["y","value"],init:function(){t.map.prototype.init.apply(this,arguments),this.pointRange=this.options.colsize||1},translate:function(){var e=this,t=e.options,r=e.xAxis,i=e.yAxis;e.generatePoints(),n(e.points,function(e){var n=(t.colsize||1)/2,o=(t.rowsize||1)/2,a=Math.round(r.len-r.translate(e.x-n,0,1,0,1)),s=Math.round(r.len-r.translate(e.x+n,0,1,0,1)),l=Math.round(i.translate(e.y-o,0,1,0,1)),u=Math.round(i.translate(e.y+o,0,1,0,1));e.plotY=1,e.shapeType="rect",e.shapeArgs={x:Math.min(a,s),y:Math.min(l,u),width:Math.abs(s-a),height:Math.abs(u-l)}}),e.pointRange=t.colsize||1,e.translateColors()},animate:function(){},getBox:function(){},getExtremes:function(){e.Series.prototype.getExtremes.call(this,this.valueData),this.valueMin=this.dataMin,this.valueMax=this.dataMax,e.Series.prototype.getExtremes.call(this)}})}(Highcharts);