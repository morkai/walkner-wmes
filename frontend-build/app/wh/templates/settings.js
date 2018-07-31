define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="settings planning-settings" autocomplete="off">\n  <div class="list-group">\n    '),["planning","users"].forEach(function(n){__append('\n    <a class="list-group-item" href="#wh/settings?tab='),__append(n),__append('" data-tab="'),__append(n),__append('">'),__append(t("wh","settings:tab:"+n)),__append("</a>\n    ")}),__append('\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-body" data-tab="planning">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-groupDuration">'),__append(t("wh","settings:planning:groupDuration")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-planning-groupDuration" class="form-control" name="wh.planning.groupDuration" type="number" step="1" min="1" max="24">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-groupExtraItems">'),__append(t("wh","settings:planning:groupExtraItems")),__append('</label>\n        <span class="help-block">'),__append(t("planning","settings:wh:groupExtraItems:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-groupExtraItems" class="form-control" name="wh.planning.groupExtraItems" type="number" step="1" min="0" max="100">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-maxSetSize">'),__append(t("wh","settings:planning:maxSetSize")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-planning-maxSetSize" class="form-control" name="wh.planning.maxSetSize" type="number" step="1" min="1" max="100">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-ignoredMrps">'),__append(t("wh","settings:planning:ignoredMrps")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-planning-ignoredMrps" name="wh.planning.ignoredMrps" type="text" data-setting>\n      </div>\n    </div>\n    <div class="panel-body" data-tab="users">\n      <div style="display: flex">\n        '),["fmx","kitter","packer"].forEach(function(n){__append('\n        <div class="form-group settings-select2-long" style="min-width: 300px; margin-right: 15px;">\n          <label>'),__append(t("wh","settings:users:"+n)),__append('</label>\n          <input type="text" data-user-func="'),__append(n),__append('">\n        </div>\n        ')}),__append("\n      </div>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});