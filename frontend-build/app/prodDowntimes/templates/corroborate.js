define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(o){return String(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="prodDowntimes-corroborate">\n  <div class="props first">\n    <div class="prop">\n      <div class="prop-name">',t("prodDowntimes","PROPERTY:prodLine"),'</div>\n      <div class="prop-value">',model.prodLine,'</div>\n    </div>\n    <div class="prop">\n      <div class="prop-name">',t("prodDowntimes","PROPERTY:shift"),'</div>\n      <div class="prop-value">',t("prodDowntimes","shift+date",{date:model.date,shift:model.shift}),'</div>\n    </div>\n    <div class="prop">\n      <div class="prop-name">',t("prodDowntimes","PROPERTY:startedAt"),'</div>\n      <div class="prop-value">',model.startedAt,'</div>\n    </div>\n    <div class="prop">\n      <div class="prop-name">',t("prodDowntimes","PROPERTY:finishedAt"),'</div>\n      <div class="prop-value prodDowntimes-corroborate-finishedAt">',model.finishedAt,'</div>\n    </div>\n    <div class="prop">\n      <div class="prop-name">',t("prodDowntimes","PROPERTY:aor"),'</div>\n      <div class="prop-value">',escape(model.aor),'</div>\n    </div>\n    <div class="prop">\n      <div class="prop-name">',t("prodDowntimes","PROPERTY:reason"),'</div>\n      <div class="prop-value">',escape(model.reason),'</div>\n    </div>\n    <div class="prop">\n      <div class="prop-name">',t("prodDowntimes","PROPERTY:reasonComment"),'</div>\n      <div class="prop-value">\n        '),model.reasonComment&&model.reasonComment.length?buf.push('\n        <p class="prodDowntimes-corroborate-reasonComment">',escape(model.reasonComment),"</p>\n        "):buf.push("\n        -\n        "),buf.push('\n      </div>\n    </div>\n  </div>\n  <div class="form-group">\n    <textarea id="',idPrefix,'-decisionComment" class="form-control prodDowntimes-corroborate-decisionComment" placeholder="',t("prodDowntimes","corroborate:decisionComment"),'" autofocus></textarea>\n  </div>\n  <div class="form-actions">\n    <button type="button" class="btn btn-success">',t("prodDowntimes","corroborate:confirm"),'</button>\n    <button type="button" class="btn btn-danger">',t("prodDowntimes","corroborate:reject"),"</button>\n    "),"#"===cancelUrl?buf.push('\n    <button type="button" class="cancel btn btn-link">',t("prodDowntimes","corroborate:cancel"),"</button>\n    "):buf.push('\n    <a class="cancel" href="',cancelUrl,'">',t("prodDowntimes","corroborate:cancel"),"</a>\n    "),buf.push("\n  </div>\n</div>\n")}();return buf.join("")}});