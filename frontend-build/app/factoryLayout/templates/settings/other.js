define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel-body" data-tab="other">\n  <div class="form-group">\n    <label for="',idPrefix,'-extendedDowntimeDelay">',t("factoryLayout","settings:extendedDowntimeDelay"),'</label>\n    <input id="',idPrefix,'-extendedDowntimeDelay" class="form-control" name="factoryLayout.extendedDowntimeDelay" type="number" value="15" step="1" min="5" max="1440">\n  </div>\n</div>\n')}();return buf.join("")}});