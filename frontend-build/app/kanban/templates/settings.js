define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="settings kanban-settings">\n  <div class="list-group">\n    <a class="list-group-item" href="#kanban;settings?tab=import" data-tab="import">'),__append(t("kanban","settings:tab:import")),__append('</a>\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-body" data-tab="import">\n      '),["maktLanguage","mlgtStorageType","mlgtWarehouseNo","pkhdStorageType"].forEach(function(n){__append('\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append("-import-"),__append(n),__append('">'),__append(t("kanban","settings:import:"+n)),__append('</label>\n        <input id="'),__append(idPrefix),__append("-import-"),__append(n),__append('" class="form-control" name="kanban.import.'),__append(n),__append('" type="text" autocomplete="new-password" data-change-delay="0">\n      </div>\n      ')}),__append("\n    </div>\n  </div>\n</form>\n");return __output.join("")}});