// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/core/views/ListView"],function(t,e,s){"use strict";function i(t,e,s,i){var d="";e&&(d+=" "+e);var r=t.observer;return r&&r.notify&&r.changes&&(r.changes[s||this.id]||r.changes[i])&&(d+=" is-changed"),'class="'+d+'"'}return s.extend({className:"d8Entries-list is-clickable",serializeColumns:function(){var s=t.partial(i,t,"is-min"),d=t.partial(i,t,"is-min","strips");return[{id:"rid",className:"is-min is-number"},{id:"statusText",tdAttrs:s,label:e("d8Entries","PROPERTY:status")},{id:"entrySource",tdAttrs:s},{id:"stripNos",tdAttrs:d,label:e("d8Entries","PROPERTY:strips.no")},{id:"stripDates",tdAttrs:d,label:e("d8Entries","PROPERTY:strips.date")},{id:"stripFamilies",tdAttrs:d,label:e("d8Entries","PROPERTY:strips.family")},{id:"problemDescription",tdAttrs:i},{id:"problemSource",tdAttrs:i},{id:"team",tdAttrs:t.partial(i,t,null,"owner","members")},{id:"crsRegisterDate",tdAttrs:s,label:e("d8Entries","LIST:crsRegisterDate")},{id:"d8OpenDate",tdAttrs:s,label:e("d8Entries","LIST:d8OpenDate")},{id:"d5PlannedCloseDate",tdAttrs:s,label:e("d8Entries","LIST:d5PlannedCloseDate")},{id:"d5CloseDate",tdAttrs:s,label:e("d8Entries","LIST:d5CloseDate")},{id:"d8CloseDate",tdAttrs:s,label:e("d8Entries","LIST:d8CloseDate")}]},serializeActions:function(){var t=this.collection;return function(i){var d=t.get(i._id),r=d.get("attachment"),a=[s.actions.viewDetails(d),{id:"download",icon:"download",label:e("d8","LIST:ACTION:download"),href:r?"/d8/"+d.id+"/attachments/"+r._id+"?download=1":"/",disabled:!!r}];return d.canEdit()&&a.push(s.actions.edit(d)),d.canDelete()&&a.push(s.actions["delete"](d)),a}}})});