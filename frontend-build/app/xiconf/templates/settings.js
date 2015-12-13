define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="settings xiconf-settings">\n  <div class="list-group">\n    <a class="list-group-item" href="#xiconf;settings?tab=clients" data-tab="clients">'),__append(t("xiconf","settings:tab:clients")),__append('</a>\n    <a class="list-group-item" href="#xiconf;settings?tab=notifier" data-tab="notifier">'),__append(t("xiconf","settings:tab:notifier")),__append('</a>\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-body" data-tab="clients">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-clients-version">'),__append(t("xiconf","settings:appVersion")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-clients-version" class="form-control" name="xiconf.appVersion" type="text" value="">\n      </div>\n    </div>\n    <div class="panel-body" data-tab="notifier">\n      <div class="checkbox">\n        <label class="control-label">\n          <input id="'),__append(idPrefix),__append('-notifier-enabled" name="xiconf.notifier.enabled" type="checkbox" value="true">\n          '),__append(t("xiconf","settings:notifier:enabled")),__append('\n        </label>\n      </div>\n      <div class="checkbox">\n        <label class="control-label">\n          <input id="'),__append(idPrefix),__append('-notifier-emptyLeds" name="xiconf.notifier.emptyLeds" type="checkbox" value="true">\n          '),__append(t("xiconf","settings:notifier:emptyLeds")),__append('\n        </label>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-notifier-delay">'),__append(t("xiconf","settings:notifier:delay")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-notifier-delay" class="form-control" name="xiconf.notifier.delay" type="number" min="1" max="30">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-notifier-nameFilter">'),__append(t("xiconf","settings:notifier:nameFilter")),__append('</label>\n        <textarea id="'),__append(idPrefix),__append('-notifier-nameFilter" class="form-control" name="xiconf.notifier.nameFilter" rows="5"></textarea>\n      </div>\n    </div>\n  </div>\n</form>\n');return __output.join("")}});