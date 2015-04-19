define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form class="settings factoryLayout-settings">\n  <div class="list-group">\n    '),["blacklist","divisionColors","other"].forEach(function(u){__output.push('\n    <a class="list-group-item" href="#reports;settings?tab='),__output.push(u),__output.push('" data-tab="'),__output.push(u),__output.push('">'),__output.push(t("factoryLayout","settings:tab:"+u)),__output.push("</a>\n    ")}),__output.push('\n  </div>\n  <div class="panel panel-primary">\n    '),function(){__output.push('<div class="panel-body" data-tab="blacklist">\n  '),["division","subdivision","mrpController","prodFlow","workCenter","prodLine"].forEach(function(u){__output.push('\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push("-blacklist-"),__output.push(u),__output.push('">'),__output.push(t("core","ORG_UNIT:"+u)),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push("-blacklist-"),__output.push(u),__output.push('" name="factoryLayout.blacklist.'),__output.push(u),__output.push('" type="text">\n  </div>\n  ')}),__output.push("\n</div>\n")}(),__output.push("\n    "),function(){__output.push('<div class="panel-body" data-tab="divisionColors">\n  '),divisions.forEach(function(t){__output.push("\n  "),__output.push(renderColorPicker({idPrefix:idPrefix,property:t.property,label:t.label,value:t.color})),__output.push("\n  ")}),__output.push("\n</div>\n")}(),__output.push("\n    "),function(){__output.push('<div class="panel-body" data-tab="other">\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-extendedDowntimeDelay">'),__output.push(t("factoryLayout","settings:extendedDowntimeDelay")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-extendedDowntimeDelay" class="form-control" name="factoryLayout.extendedDowntimeDelay" type="number" value="15" step="1" min="5" max="1440">\n  </div>\n</div>\n')}(),__output.push("\n  </div>\n</form>\n");return __output.join("")}});