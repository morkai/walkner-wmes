// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","../broker","../pubsub","../kaizenSections/KaizenSectionCollection","../kaizenAreas/KaizenAreaCollection","../kaizenCategories/KaizenCategoryCollection","../kaizenCauses/KaizenCauseCollection","../kaizenRisks/KaizenRiskCollection"],function(e,s,a,t,n,i,l,o){"use strict";function r(){d=null,null!==k&&(k.destroy(),k=null),z.loaded=!1,z.types=[],z.statuses=[],z.sections.reset(),z.areas.reset(),z.categories.reset(),z.causes.reset(),z.risks.reset()}function u(e,a){var t=a.split("."),n=z[t[1]];if(n){switch(t[1]){case"added":n.add(e.model);break;case"edited":var i=n.get(e.model._id);i&&i.set(e.model);break;case"deleted":n.remove(n.get(e.model._id))}s.publish(a,e)}}var c=null,d=null,k=null,z={types:[],statuses:[],sections:new t,areas:new n,categories:new i,causes:new l,risks:new o,loaded:!1,load:function(){return null!==d&&(clearTimeout(d),d=null),z.loaded?null:null!==c?c:(c=e.ajax({url:"/kaizen/dictionaries"}),c.done(function(e){z.loaded=!0,z.types=e.types,z.statuses=e.statuses,z.sections.reset(e.sections),z.areas.reset(e.areas),z.categories.reset(e.categories),z.causes.reset(e.causes),z.risks.reset(e.risks)}),c.fail(r),c.always(function(){c=null}),k=a.sandbox(),k.subscribe("kaizen.**",u),c)},unload:function(){null!==d&&clearTimeout(d),d=setTimeout(r,6e4)}};return z});