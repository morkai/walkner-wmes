define(["jquery","app/broker","app/pubsub","app/user","app/i18n","app/wmes-osh-companies/CompanyCollection","app/wmes-osh-divisions/DivisionCollection","app/wmes-osh-workplaces/WorkplaceCollection","app/wmes-osh-departments/DepartmentCollection","app/wmes-osh-buildings/BuildingCollection","app/wmes-osh-locations/LocationCollection","app/wmes-osh-stations/StationCollection","app/wmes-osh-kinds/KindCollection","app/wmes-osh-activityKinds/ActivityKindCollection","app/wmes-osh-observationKinds/ObservationKindCollection","app/wmes-osh-observationCategories/ObservationCategoryCollection","app/wmes-osh-eventCategories/EventCategoryCollection","app/wmes-osh-reasonCategories/ReasonCategoryCollection","app/wmes-osh-rootCauseCategories/RootCauseCategoryCollection","app/wmes-osh-kaizenCategories/KaizenCategoryCollection","app/wmes-osh-nearMisses/NearMiss","app/wmes-osh-kaizens/Kaizen","app/wmes-osh-actions/Action","app/wmes-osh-observations/Observation","./SettingCollection"],function(e,o,s,n,i,t,a,r,l,c,d,p,u,g,m,C,w,b,h,y,v,f,k,O,K){"use strict";const T="osh",z={company:"companies",division:"divisions",workplace:"workplaces",department:"departments",building:"buildings",location:"locations",station:"stations",kind:"kinds",activityKind:"activityKinds",observationKind:"observationKinds",observationCategory:"observationCategories",eventCategory:"eventCategories",reasonCategory:"reasonCategories",rootCauseCategory:"rootCauseCategories",kaizenCategory:"kaizenCategories"},_={nearMiss:v,kaizen:f,action:k,observation:O};let A=null,E=null,M=null,P=null,D=null;const L=new WeakSet,R={TYPE_TO_PREFIX:{nearMiss:"Z",kaizen:"K",action:"A",observation:"O"},PREFIX_TO_TYPE:{Z:"nearMiss",K:"kaizen",A:"action",O:"observation"},TYPE_TO_MODULE:{nearMiss:"nearMisses",kaizen:"kaizens",action:"actions",observation:"observations"},TYPE_TO_MODEL:_,statuses:{nearMiss:[],kaizen:[],actions:[],observations:[]},priorities:[],kindTypes:[],settings:new K,companies:new t,divisions:new a,workplaces:new r,departments:new l,buildings:new c,locations:new d,stations:new p,kinds:new u,activityKinds:new g,observationKinds:new m,observationCategories:new C,eventCategories:new w,reasonCategories:new b,rootCauseCategories:new h,kaizenCategories:new y,loaded:!1,load:function(){return null!==E&&(clearTimeout(E),E=null),R.loaded?null:null!==A?A:((A=e.ajax({url:"/osh/dictionaries"})).done(e=>{R.loaded=!0,$(e)}),A.fail(j),A.always(()=>A=null),M=s.sandbox(),Object.keys(z).forEach(e=>{M.subscribe(`${T}.${z[e]}.**`,I)}),R.settings.setUpPubsub(M),S(),A)},unload:function(){null!==E&&clearTimeout(E),E=setTimeout(j,3e4)},getLabel:function(e,o,s){if("priority"===e)return i("wmes-osh-common",`priority:${o}`);if(!o)return"";if("status"===e)return i("wmes-osh-common",`status:${o}`);if("string"==typeof e&&(e=this.forProperty(e)||R[e]),!e||Array.isArray(e))return String(o);const n=e.get(o);return n?n.getLabel(s):String(o)},getDescription:function(e,o){if("string"==typeof e&&(e=this.forProperty(e)||R[e]),!e||Array.isArray(e))return"";const s=e.get(o);return s&&s.get("description")||""},forProperty:function(e){return this[z[e]]||null},bind:function(e){return L.has(e)?e:(L.add(e),e.on("beforeLoad",(e,o)=>{o.push(this.load())}),e.on("afterRender",()=>{this.load()}),e.once("remove",()=>{this.unload(),L.delete(e)}),e)},isCoordinator:function(){return null===D&&(D=n.isAllowedTo("OSH:COORDINATOR")||R.kinds.some(e=>e.get("coordinators").some(e=>e.id===n.data._id))||R.departments.some(e=>e.get("coordinators").some(e=>e.id===n.data._id))),D}};function S(){P&&(P.cancel(),P=null),M&&n.isLoggedIn()&&(P=M.subscribe(`${T}.*.seen.${n.data._id}`,(e,s)=>o.publish(s,e)))}function $(e){e&&["statuses","priorities","kindTypes"].forEach(o=>{e[o]&&(R[o]=e[o])}),Object.keys(z).forEach(o=>{const s=z[o];Array.isArray(R[s])?R[s]=e?e[s]:[]:R[s]&&R[s].reset&&R[s].reset(e?e[s]:[])}),R.settings.reset(e?e.settings:[])}function j(){E=null,null!==M&&(M.destroy(),M=null,P=null),R.loaded=!1,$()}function I(e,s){const n=s.split("."),i=R[n[1]];if(i){switch(n[2]){case"added":i.add(e.model);break;case"edited":{const o=i.get(e.model._id);o&&o.set(e.model);break}case"deleted":i.remove(i.get(e.model._id))}o.publish(s,e)}}return o.subscribe("user.reloaded",()=>S()),R.kinds.on("reset change:coordinators",()=>D=null),R.departments.on("reset change:coordinators",()=>D=null),window.oshDictionaries=R});