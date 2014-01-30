define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="production-downtimePicker">\n  <div class="form-group">\n    <label for="',idPrefix,'-reason">',t("production","downtimePicker:reason:label"),'</label>\n    <input id="',idPrefix,'-reason" type="text" placeholder="',t("production","downtimePicker:reason:placeholder"),'">\n  </div>\n  <div class="form-group">\n    <label for="',idPrefix,'-aor">',t("production","downtimePicker:aor:label"),'</label>\n    <input id="',idPrefix,'-aor" type="text" placeholder="',t("production","downtimePicker:aor:placeholder"),'">\n  </div>\n  <div class="form-group">\n    <label for="',idPrefix,'-reasonComment">',t("production","downtimePicker:reasonComment:label"),'</label>\n    <textarea id="',idPrefix,'-reasonComment" class="form-control" placeholder="',t("production","downtimePicker:reasonComment:placeholder"),'"></textarea>\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-danger">',t("production","downtimePicker:submit"),'</button>\n    <button type="button" class="cancel btn btn-link">',t("production","downtimePicker:cancel"),"</button>\n  </div>\n</form>\n")}();return buf.join("")}});