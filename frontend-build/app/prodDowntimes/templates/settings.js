define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form class="reports-settings">\n  <div class="list-group">\n    <a class="list-group-item" href="#prodDowntimes;settings?tab=default" data-tab="default">'),__output.push(t("prodDowntimes","settings:tab:default")),__output.push('</a>\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-body" data-tab="default">\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-autoConfirmHours">'),__output.push(t("prodDowntimes","settings:autoConfirmHours")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-autoConfirmHours" class="form-control" name="prodDowntimes.autoConfirmHours" type="number" value="168" step="1" min="24">\n      </div>\n    </div>\n  </div>\n</form>\n');return __output.join("")}});