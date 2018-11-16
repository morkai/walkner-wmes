define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(t){return _ENCODE_HTML_RULES[t]||t}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="settings fte-settings">\n  <div class="list-group">\n    <a class="list-group-item" href="#fte;settings?tab=general" data-tab="general">'),__append(t("fte","settings:tab:general")),__append('</a>\n    <a class="list-group-item" href="#fte;settings?tab=structure" data-tab="structure">'),__append(t("fte","settings:tab:structure")),__append('</a>\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-body" data-tab="general">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-general-absenceTasks" class="control-label">'),__append(t("fte","settings:general:absenceTasks")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-general-absenceTasks" name="fte.absenceTasks" type="text" autocomplete="new-password" data-setting>\n      </div>\n    </div>\n    <div class="panel-body" data-tab="structure">\n      <div class="form-group">\n        <input id="'),__append(idPrefix),__append('-structure-subdivision" type="text" autocomplete="new-password">\n      </div>\n      <table class="table table-condensed table-with-tfoot">\n        <thead>\n        <tr>\n          <th class="is-min">'),__append(t("core","#")),__append('</th>\n          <th class="is-min">'),__append(t("fte","settings:structure:prodFunction")),__append("</th>\n          <th>"),__append(t("fte","settings:structure:companies")),__append('</th>\n          <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append('</th>\n        </tr>\n        </thead>\n        <tfoot>\n        <tr>\n          <td colspan="4"><input id="'),__append(idPrefix),__append('-structure-prodFunction" type="text" autocomplete="new-password"></td>\n        </tr>\n        </tfoot>\n        <tbody id="'),__append(idPrefix),__append('-structure"></tbody>\n      </table>\n    </div>\n  </div>\n</form>\n');return __output.join("")}});