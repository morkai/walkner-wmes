// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","../broker","../pubsub","../user","../data/createSettings","../opinionSurveyDivisions/OpinionSurveyDivisionCollection","../opinionSurveyEmployers/OpinionSurveyEmployerCollection","../opinionSurveyQuestions/OpinionSurveyQuestionCollection","./OpinionSurveySettingCollection"],function(e,n,i,o,t,l,s,u,r){"use strict";function a(){p=null,null!==v&&(v.destroy(),v=null),g.loaded=!1,c.forEach(function(e){g[e].reset()}),y.release(),g.settings.reset([])}function d(e,i){var o=i.split("."),t=g[o[1]];if(t){switch(o[1]){case"added":t.add(e.model);break;case"edited":var l=t.get(e.model._id);l&&l.set(e.model);break;case"deleted":t.remove(t.get(e.model._id))}n.publish(i,e)}}var c=["divisions","employers","questions"],f=null,p=null,v=null,y=t(r),g={actionStatuses:["planned","progress","done","failed","late"],settings:y.acquire(),divisions:new l,employers:new s,questions:new u,loaded:!1,load:function(){return null!==p&&(clearTimeout(p),p=null),g.loaded?null:null!==f?f:(f=e.ajax({url:"/opinionSurveys/dictionaries"}),f.done(function(e){g.loaded=!0,c.forEach(function(n){g[n].reset(e[n])}),g.settings.reset(e.settings)}),f.fail(a),f.always(function(){f=null}),v=i.sandbox(),c.forEach(function(e){v.subscribe("opinionSurveys."+e+".**",d)}),f)},unload:function(){null!==p&&clearTimeout(p),p=setTimeout(a,3e4)},getLabel:function(e,n){if(!g[e])return n;var i=g[e].get(n);return i?i.getLabel():n}};return g});