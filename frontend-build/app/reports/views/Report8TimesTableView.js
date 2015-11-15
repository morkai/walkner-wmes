// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/highcharts","app/core/View","app/data/aors","app/reports/templates/report8TimesTable"],function(e,i,r,t,a){"use strict";return r.extend({template:a,events:{},initialize:function(){this.listenTo(this.model,"change",this.render)},destroy:function(){},serialize:function(){return{idPrefix:this.idPrefix,props:this.serializeProps()}},serializeProp:function(e,i,r,t,a){var n={plan:"",real:"",unit:a,className:""},s=i[r];return Array.isArray(s)?(n.plan=this.formatValue(s[0],t),n.real=this.formatValue(s[1],t)):n["heijunkaTimeForLine"===r?"plan":"real"]=this.formatValue(s,t),e[r]=n,n},formatValue:function(e,r){return i.numberFormat(e,r)},serializeProps:function(){var i=this.model.query.get("unit"),r=e("reports","8:times:unit:"+i),a=2,n=this.model.get("summary"),s={},o=this;return["timeAvailablePerShift","routingTimeForLine","routingTimeForLabour","heijunkaTimeForLine","breaks","fap0","startup","shutdown","meetings","sixS","tpm","trainings","coTime","downtime"].forEach(function(e){o.serializeProp(s,n,e,a,r)}),_.forEach(n.downtimeByAor,function(e,i){var n=t.get(i);s[i]={name:n?n.getLabel():i,plan:"",real:o.formatValue(e,a),unit:r,className:""}}),this.serializeProp(s,n,"plan",0,e("reports","8:times:unit:pcs")),this.serializeProp(s,n,"efficiency",0,e("reports","8:times:unit:%")),s},beforeRender:function(){},afterRender:function(){}})});