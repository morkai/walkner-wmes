// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.

// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.

define(["underscore","../data/aors","../data/downtimeReasons","../data/orgUnits","../core/Model"],function(t,a,i,n,o){function e(t,a){return t&&t[a]?t[a]:[0,0]}function r(t){return Math.round(100*t)/100}return o.extend({urlRoot:"/reports/3",defaults:function(){return{workDays:{},groupKeys:[],prodLines:[],tableSummary:[],chartSummary:{}}},initialize:function(t,a){if(!a.query)throw new Error("query option is required!");this.query=a.query},calcTableSummary:function(t){arguments.length||(t=this.get("prodLines"));for(var a=[],i={},n=0,o=t.length;o>n;++n){var e=t[n];this.query.matchProdLine(e)&&(a.push(e),i[e._id]=!0)}return arguments.length||this.set("tableSummary",a),this.query.diffProdLines(i),a},calcChartSummary:function(t,a,i){arguments.length||(t=this.get("workDays"),a=this.get("groupKeys"),i=this.get("tableSummary"));for(var n={categories:[],totalAvailabilityH:[],operationalAvailabilityH:[],exploitationH:[],oee:[],operationalAvailabilityP:[],exploitationP:[],adjustingDuration:[],maintenanceDuration:[],renovationDuration:[],malfunctionDuration:[],mttr:[],mttf:[],mtbf:[],malfunctionCount:[],majorMalfunctionCount:[]},o=0,e=a.length;e>o;++o){for(var u=a[o],l=0,s=0,c=0,m=0,d=0,f=0,y=0,p=0,h=0,D=0,v=0,b=0,H=0,g=i.length;g>H;++H){var A=i[H];if(this.query.isProdLineSelected(A._id,!0)){var P=A.data[u];void 0===P&&(P=this.createDefaultDataPoint(t?t[u]:1)),l+=P.totalAvailabilityH,s+=P.scheduledDuration,c+=P.unscheduledDuration,m+=P.exploitationH,d+=P.adjustingDuration,f+=P.maintenanceDuration,y+=P.renovationDuration,p+=P.malfunctionDuration,h+=P.malfunctionCount,D+=P.majorMalfunctionCount,v+=P.quantityDone,b+=P.quantityLost}}var j=l-s-c,q=j/l*100,L=m/j*100,x=this.calcOee(j,l,m,v,b),C=+u;n.totalAvailabilityH.push([C,l]),n.operationalAvailabilityH.push([C,r(j)]),n.exploitationH.push([C,r(m)]),n.oee.push([C,r(x)]),n.operationalAvailabilityP.push([C,r(q)]),n.exploitationP.push([C,r(L)]),n.adjustingDuration.push([C,r(d)]),n.maintenanceDuration.push([C,r(f)]),n.renovationDuration.push([C,r(y)]),n.malfunctionDuration.push([C,r(p)]),n.malfunctionCount.push([C,h]),n.majorMalfunctionCount.push([C,D]);var w=0,k=0;h>0&&(w=p/h,k=j/h);var S=r(k+w);n.mttr.push([C,r(w)]),n.mttf.push([C,r(k)]),n.mtbf.push([C,0===S?j:S])}return arguments.length||this.set("chartSummary",n),n},createDefaultDataPoint:function(t){return{workDays:t,totalAvailabilityH:24*t,scheduledDuration:0,unscheduledDuration:0,operationalAvailabilityH:24*t,operationalAvailabilityP:100,exploitationH:0,exploitationP:0,oee:0,adjustingDuration:0,maintenanceDuration:0,renovationDuration:0,malfunctionDuration:0,malfunctionCount:0,majorMalfunctionCount:0,malfunctions:null,mttr:0,mttf:0,mtbf:0,quantityDone:0,quantityLost:0}},fetch:function(a){return t.isObject(a)||(a={}),a.data=t.extend(a.data||{},this.query.serializeToObject()),o.prototype.fetch.call(this,a)},parse:function(t){var a=t.options.workDays,i={},n=this.parseProdLines(t.options,t.results,i);i=this.parseGroupKeys(i);var o=this.calcTableSummary(n),e=this.calcChartSummary(a,i,o);return{workDays:a,groupKeys:i,prodLines:n,tableSummary:o,chartSummary:e}},parseProdLines:function(t,a,i){for(var n=[],o=t.prodLinesInfo,e=0,r=o.length;r>e;e+=4){var u=a[o[e]],l={_id:o[e],division:o[e+1],subdivisionType:o[e+2],inventoryNo:o[e+3],workDays:t.totalWorkDays,scheduledDuration:0,unscheduledDuration:0,totalAvailabilityH:0,operationalAvailabilityH:0,operationalAvailabilityP:0,exploitationH:0,exploitationP:0,oee:0,adjustingDuration:0,maintenanceDuration:0,renovationDuration:0,malfunctionDuration:0,malfunctionCount:0,majorMalfunctionCount:0,mttr:0,mttf:0,mtbf:0,quantityDone:0,quantityLost:0,data:{}};u&&this.parseProdLineData(t,l,u,i),this.summarizeProdLine(l),n.push(l)}return n},parseProdLineData:function(t,a,i,n){var o=this;Object.keys(i).forEach(function(r){n[r]=!0;var u=i[r],l=u.w||0,s=(t.workDays?t.workDays[r]:1)+l,c=24*s,m=u.e,d=e(u.d,"scheduled")[1],f=e(u.d,"unscheduled")[1],y=c-d-f,p=y/c*100,h=e(u.d,"adjusting")[1],D=e(u.d,"maintenance")[1],v=e(u.d,"renovation")[1],b=e(u.d,"malfunction"),H=b[0],g=b[1],A=e(u.d,"majorMalfunction")[0],P=u.m||null,j=u.q||0,q=u.l||0,L=H?g/H:0,x=H?y/H:0;a.workDays+=l,a.scheduledDuration+=d,a.unscheduledDuration+=f,a.exploitationH+=m,a.adjustingDuration+=h,a.maintenanceDuration+=D,a.renovationDuration+=v,a.malfunctionCount+=H,a.malfunctionDuration+=g,a.majorMalfunctionCount+=A,a.quantityDone+=j,a.quantityLost+=q,a.data[r]={workDays:s,totalAvailabilityH:c,scheduledDuration:d,unscheduledDuration:f,operationalAvailabilityH:y,operationalAvailabilityP:p,exploitationH:m,exploitationP:m/y*100,oee:0,adjustingDuration:h,maintenanceDuration:D,renovationDuration:v,malfunctionDuration:g,malfunctionCount:H,majorMalfunctionCount:A,malfunctions:P,mttr:L,mttf:x,mtbf:x+L,quantityDone:j,quantityLost:q},o.calcProdLineOee(a.data[r],!1)})},summarizeProdLine:function(t){t.totalAvailabilityH=24*t.workDays,t.operationalAvailabilityH=r(t.totalAvailabilityH-t.scheduledDuration-t.unscheduledDuration),t.operationalAvailabilityP=r(t.operationalAvailabilityH/t.totalAvailabilityH*100),t.exploitationH=r(t.exploitationH),t.exploitationP=r(t.exploitationH/t.operationalAvailabilityH*100),t.adjustingDuration=r(t.adjustingDuration),t.maintenanceDuration=r(t.maintenanceDuration),t.renovationDuration=r(t.renovationDuration),t.malfunctionDuration=r(t.malfunctionDuration),t.malfunctionCount>0?(t.mttr=r(t.malfunctionDuration/t.malfunctionCount),t.mttf=r(t.operationalAvailabilityH/t.malfunctionCount),t.mtbf=t.mttr+t.mttf):(t.mttr=0,t.mttf=0,t.mtbf=t.operationalAvailabilityH),this.calcProdLineOee(t,!0)},calcProdLineOee:function(t,a){var i=this.calcOee(t.operationalAvailabilityH,t.totalAvailabilityH,t.exploitationH,t.quantityDone,t.quantityLost);t.oee=a?r(i):i},calcOee:function(t,a,i,n,o){var e=n+o;if(0===a||0===t||0===e)return 0;var r=t/a,u=i/t,l=n/e;return r*u*l*100},parseGroupKeys:function(t){return Object.keys(t).sort(function(t,a){return t-a})}})});