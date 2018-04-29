define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="settings planning-settings">\n  <div class="list-group">\n    <a class="list-group-item" href="#planning/settings?tab=wh" data-tab="wh">'),__append(t("planning","settings:tab:wh")),__append('</a>\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-body" data-tab="wh">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-wh-groupDuration">'),__append(t("planning","settings:wh:groupDuration")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-wh-groupDuration" class="form-control" name="planning.wh.groupDuration" type="number" step="1" min="1" max="24">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-wh-groupExtraItems">'),__append(t("planning","settings:wh:groupExtraItems")),__append('</label>\n        <span class="help-block">'),__append(t("planning","settings:wh:groupExtraItems:help")),__append('</span>\n        <input id="'),__append(idPrefix),__append('-wh-groupExtraItems" class="form-control" name="planning.wh.groupExtraItems" type="number" step="1" min="0" max="100">\n      </div>\n      <div class="checkbox">\n        <label class="control-label">\n          <input id="'),__append(idPrefix),__append('-wh-sortByLines" name="planning.wh.sortByLines" type="checkbox" value="true">\n            '),__append(t("planning","settings:wh:sortByLines")),__append('\n        </label>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-wh-ignoredMrps">'),__append(t("planning","settings:wh:ignoredMrps")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-wh-ignoredMrps" name="planning.wh.ignoredMrps" type="text" data-setting>\n      </div>\n    </div>\n  </div>\n</form>\n');return __output.join("")}});