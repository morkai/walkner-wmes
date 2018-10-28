define(["underscore","app/i18n","../settings/SettingCollection","./KanbanSetting"],function(e,r,t,n){"use strict";var o={darkblue:"#0000BB",violet:"#663399",lavender:"#C7A2C6",lightblue:"#00AAFF",grey:"#A0A0A0",red:"#EE0000",orange:"#FF8800",yellow:"#FFEE00",sand:"#C09D79",green:"#009900",cyan:"#00CDCD",black:"#000000"};return t.extend({model:n,topicSuffix:"kanban.**",getValue:function(e){var r=this.get("kanban."+e);return r?r.getValue():null},updateRowColor:function(r,t){var n=e.clone(this.getValue("rowColors"));return e.isObject(n)||(n={}),t?n[r]=t:delete n[r],this.update("kanban.rowColors",n)},getRowColor:function(e){var r=this.getValue("rowColors");return r&&r[e]||null},getMarkerColor:function(e){return this.constructor.getMarkerColor(e)}},{MARKER_COLORS:Object.keys(o),getMarkerColors:function(){return this.MARKER_COLORS.map(this.getMarkerColor)},getMarkerColor:function(e){return{id:e,text:r("kanban","color:"+e),color:o[e]||e}}})});