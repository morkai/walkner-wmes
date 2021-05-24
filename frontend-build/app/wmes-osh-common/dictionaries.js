define(["jquery","app/broker","app/pubsub","app/user","app/i18n","app/wmes-osh-companies/CompanyCollection","app/wmes-osh-divisions/DivisionCollection","app/wmes-osh-workplaces/WorkplaceCollection","app/wmes-osh-departments/DepartmentCollection","app/wmes-osh-buildings/BuildingCollection","app/wmes-osh-locations/LocationCollection","app/wmes-osh-stations/StationCollection","app/wmes-osh-kinds/KindCollection","app/wmes-osh-activityKinds/ActivityKindCollection","app/wmes-osh-observationKinds/ObservationKindCollection","app/wmes-osh-observationCategories/ObservationCategoryCollection","app/wmes-osh-eventCategories/EventCategoryCollection","app/wmes-osh-reasonCategories/ReasonCategoryCollection","app/wmes-osh-rootCauseCategories/RootCauseCategoryCollection","app/wmes-osh-kaizenCategories/KaizenCategoryCollection","app/wmes-osh-nearMisses/NearMiss","app/wmes-osh-kaizens/Kaizen","app/wmes-osh-actions/Action","app/wmes-osh-observations/Observation","./SettingCollection","i18n!app/nls/wmes-osh-common"],function(e,o,n,s,i,t,a,r,l,c,d,p,u,m,g,w,C,b,y,h,v,f,k,O,T){"use strict";const K="osh",_={company:"companies",division:"divisions",workplace:"workplaces",department:"departments",building:"buildings",location:"locations",station:"stations",kind:"kinds",activityKind:"activityKinds",observationKind:"observationKinds",observationCategory:"observationCategories",eventCategory:"eventCategories",reasonCategory:"reasonCategories",rootCauseCategory:"rootCauseCategories",kaizenCategory:"kaizenCategories"},z={nearMiss:"Z",kaizen:"K",action:"A",observation:"O"},A={nearMiss:v,kaizen:f,action:k,observation:O};let E=null,P=null,M=null,D=null,L=null;const R=new WeakSet,S={TYPE_TO_PREFIX:z,PREFIX_TO_TYPE:{Z:"nearMiss",K:"kaizen",A:"action",O:"observation"},TYPE_TO_MODULE:{nearMiss:"nearMisses",kaizen:"kaizens",action:"actions",observation:"observations"},TYPE_TO_MODEL:A,ORG_UNITS:["division","workplace","department","building","location","station"],statuses:{nearMiss:[],kaizen:[],actions:[],observations:[]},priorities:[],kindTypes:[],entryTypes:Object.keys(z),settings:new T,companies:new t,divisions:new a,workplaces:new r,departments:new l,buildings:new c,locations:new d,stations:new p,kinds:new u,activityKinds:new m,observationKinds:new g,observationCategories:new w,eventCategories:new C,reasonCategories:new b,rootCauseCategories:new y,kaizenCategories:new h,currencyFormatter:new Intl.NumberFormat("pl",{style:"currency",currency:"PLN"}),loaded:!1,load:function(){return null!==P&&(clearTimeout(P),P=null),S.loaded?e.Deferred().resolve():null!==E?E:((E=e.ajax({url:"/osh/dictionaries"})).done(e=>{S.loaded=!0,$(e)}),E.fail(j),E.always(()=>E=null),M=n.sandbox(),Object.keys(_).forEach(e=>{M.subscribe(`${K}.${_[e]}.**`,N)}),S.settings.setUpPubsub(M),I(),E)},unload:function(){null!==P&&clearTimeout(P),P=setTimeout(j,3e4)},getLabel:function(e,o,n){if(null==o)return"";if("priority"===e)return i("wmes-osh-common",`priority:${o}`);if("status"===e)return i("wmes-osh-common",`status:${o}`);if(!o)return"";if("string"==typeof e&&(e=this.forProperty(e)||S[e]),!e||Array.isArray(e))return String(o);const s=e.get(o);return s?s.getLabel(n):String(o)},getDescription:function(e,o){if("string"==typeof e&&(e=this.forProperty(e)||S[e]),!e||Array.isArray(e))return"";const n=e.get(o);return n&&n.get("description")||""},forProperty:function(e){return this[_[e]]||null},bind:function(e){return R.has(e)?e:(R.add(e),e.on("beforeLoad",(e,o)=>{o.push({priority:!0,promise:this.load()})}),e.on("afterRender",()=>{this.load()}),e.once("remove",()=>{this.unload(),R.delete(e)}),e)},isCoordinator:function(){return null===L&&(L=s.isAllowedTo("OSH:COORDINATOR")||S.kinds.some(e=>e.get("coordinators").some(e=>e.id===s.data._id))||S.departments.some(e=>e.get("coordinators").some(e=>e.id===s.data._id))),L}};function I(){D&&(D.cancel(),D=null),M&&s.isLoggedIn()&&(D=M.subscribe(`${K}.*.seen.${s.data._id}`,(e,n)=>o.publish(n,e)))}function $(e){e&&["statuses","priorities","kindTypes"].forEach(o=>{e[o]&&(S[o]=e[o])}),Object.keys(_).forEach(o=>{const n=_[o];Array.isArray(S[n])?S[n]=e?e[n]:[]:S[n]&&S[n].reset&&S[n].reset(e?e[n]:[])}),S.settings.reset(e?e.settings:[])}function j(){P=null,null!==M&&(M.destroy(),M=null,D=null),S.loaded=!1,$()}function N(e,n){const s=n.split("."),i=S[s[1]];if(i){switch(s[2]){case"added":i.add(e.model);break;case"edited":{const o=i.get(e.model._id);o&&o.set(e.model);break}case"deleted":i.remove(i.get(e.model._id))}o.publish(n,e)}}return o.subscribe("user.reloaded",()=>I()),S.kinds.on("reset change:coordinators",()=>L=null),S.departments.on("reset change:coordinators",()=>L=null),window.oshDictionaries=S});