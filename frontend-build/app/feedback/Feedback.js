// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../user","../time","../updater/index","../core/Model"],function(e,t,r,n){"use strict";var i=window;return n.extend({urlRoot:"/feedback",clientUrlRoot:"#feedback",topicPrefix:"feedback",privilegePrefix:"FEEDBACK",nlsDomain:"feedback",defaults:function(){return{project:null,savedAt:null,createdAt:null,creator:e.data._id,reporter:e.data._id,owner:null,page:{title:i.document.title,url:i.location.href},versions:r.versions,navigator:{userAgent:i.navigator.userAgent,userLanguage:i.navigator.userLanguage,platform:i.navigator.platform,width:i.screen.width,height:i.screen.height,innerWidth:i.innerWidth,innerHeight:i.innerHeight},summary:"",comment:"",type:"other",priority:null,status:null,resolution:null,expectedAt:null,pariticipants:[],watchers:[],replies:[]}}})});