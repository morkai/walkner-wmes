define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="settings wiring-settings">\n  <div class="list-group">\n    '),["planning"].forEach(function(n){__append('\n    <a class="list-group-item" href="#wiring;settings?tab='),__append(n),__append('" data-tab="'),__append(n),__append('">'),__append(helpers.t("settings:tab:"+n)),__append("</a>\n    ")}),__append('\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-body" data-tab="planning">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-namePattern">'),__append(helpers.t("settings:planning:namePattern")),__append('</label>\n        <span class="help-block">'),__append(helpers.t("settings:planning:namePattern:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-namePattern" name="wiring.namePattern" class="form-control" data-setting>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-planning-workCenters">'),__append(helpers.t("settings:planning:workCenters")),__append('</label>\n        <span class="help-block">'),__append(helpers.t("settings:planning:workCenters:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-planning-workCenters" name="wiring.workCenters" class="form-control" data-setting>\n      </div>\n    </div>\n  </div>\n</form>\n');return __output.join("")}});