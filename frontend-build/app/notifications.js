define(["jquery","app/i18n"],function(e,n){"use strict";var i=window.Notification;return window.notifications={renderRequest:function(){if("production"!==window.ENV&&i&&"granted"!==i.permission&&"denied"!==i.permission){var o=e('<div class="message message-inline message-warning notifications-request"></div>').append("<p>"+n("core","notifications:request:message")+"</p>");o.on("click",function(){"default"===i.permission?i.requestPermission().then(function(e){"granted"===e?window.location.reload():"default"!==e&&o.remove()}):o.remove()}),e(".bd").prepend(o)}},show:function(e){return i&&"granted"===i.permission?new i(e.title,e):null}}});