define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(o){return String(o).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="production-controls">\n  <a href="#" class="fa fa-home" title="',t("production","controls:dashboard"),'"></a>\n  '),user.isAllowedTo("DICTIONARIES:MANAGE")?buf.push('\n  <a class="fa fa-unlock production-controls-lock" title="',t("production","controls:lock"),'"></a>\n  <a class="fa fa-lock production-controls-unlock" title="',t("production","controls:unlock"),'"></a>\n  '):buf.push('\n  <i class="fa fa-unlock production-controls-lock" title="',t("production","controls:locked"),'"></i>\n  <i class="fa fa-lock production-controls-unlock" title="',t("production","controls:unlocked"),'"></i>\n  '),buf.push('\n  <i class="fa fa-refresh production-controls-sync" title="',t("production","controls:sync"),'"></i>\n</div>\n')}();return buf.join("")}});