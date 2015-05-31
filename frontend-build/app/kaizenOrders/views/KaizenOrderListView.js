// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/ListView"],function(t){"use strict";function e(t){return t.observer.notify&&t.observer.changes&&t.observer.changes[this.id]?'class="is-changed"':""}return t.extend({className:"kaizenOrders-list is-clickable",columns:[{id:"rid",className:"is-min is-number"},"types",{id:"status",tdAttrs:e},{id:"subject",tdAttrs:e},{id:"eventDate",tdAttrs:e},{id:"area",tdAttrs:e},{id:"cause",tdAttrs:e},{id:"risk",tdAttrs:e},{id:"nearMissCategory",tdAttrs:e},{id:"suggestionCategory",tdAttrs:e},{id:"section",tdAttrs:e},{id:"confirmer",tdAttrs:e},"creator"],serializeActions:function(){var e=this.collection;return function(s){var i=e.get(s._id),r=[t.actions.viewDetails(i)];return i.canEdit()&&r.push(t.actions.edit(i)),i.canDelete()&&r.push(t.actions["delete"](i)),r}}})});