define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="settings">\n  <div class="list-group">\n    <a class="list-group-item" href="#production;settings?tab=operator" data-tab="operator">'),__append(t("production","settings:tab:operator")),__append('</a>\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-body has-subtabs" data-tab="operator">\n      <div class="settings">\n        <div class="list-group">\n          '),["taktTime","downtimes","spigot"].forEach(function(n){__append('\n          <a class="list-group-item" href="#production;settings?tab=operator&subtab='),__append(n),__append('" data-tab="operator" data-subtab="'),__append(n),__append('">'),__append(t("production","settings:tab:"+n)),__append("</a>\n          ")}),__append('\n        </div>\n        <div class="panel panel-primary">\n          <div class="panel-body" data-subtab="taktTime">\n            <div class="checkbox">\n              <label class="control-label">\n                <input id="'),__append(idPrefix),__append('-taktTime-enabled" name="production.taktTime.enabled" type="checkbox" value="true">\n                '),__append(t("production","settings:taktTime:enabled")),__append('\n              </label>\n            </div>\n            <div class="form-group">\n              <label for="'),__append(idPrefix),__append('-taktTime-lines">'),__append(t("production","settings:taktTime:lines")),__append('</label>\n              <input id="'),__append(idPrefix),__append('-taktTime-lines" name="production.taktTime.lines" type="text" data-setting>\n            </div>\n            '),["sap","last","avg","smiley"].forEach(function(n){__append('\n            <div class="checkbox">\n              <label class="control-label">\n                <input id="'),__append(idPrefix),__append("-taktTime-"),__append(n),__append('" name="production.taktTime.'),__append(n),__append('" type="checkbox" value="true">\n                '),__append(t("production","settings:taktTime:"+n)),__append("\n              </label>\n            </div>\n            ")}),__append('\n            <div class="form-group">\n              <label for="'),__append(idPrefix),__append('-taktTime-ignoredDowntimes">'),__append(t("production","settings:taktTime:ignoredDowntimes")),__append('</label>\n              <input id="'),__append(idPrefix),__append('-taktTime-ignoredDowntimes" name="production.taktTime.ignoredDowntimes" type="text" data-setting>\n            </div>\n            <div class="form-group">\n              <label for="'),__append(idPrefix),__append('-taktTime-coeffs">'),__append(t("production","settings:taktTime:coeffs")),__append('</label>\n              <span class="help-block">'),__append(t("production","settings:taktTime:coeffs:help")),__append('</span>\n              <textarea id="'),__append(idPrefix),__append('-taktTime-coeffs" class="form-control text-mono" name="production.taktTime.coeffs" rows="5" data-keyup-delay="10000" data-change-delay="0"></textarea>\n            </div>\n          </div>\n          <div class="panel-body" data-subtab="downtimes">\n            <div class="form-group">\n              <label for="'),__append(idPrefix),__append('-initialDowntimeWindow">'),__append(t("production","settings:initialDowntimeWindow")),__append('</label>\n              <input id="'),__append(idPrefix),__append('-initialDowntimeWindow" class="form-control" name="production.initialDowntimeWindow" type="number" step="1" min="0" max="60">\n            </div>\n          </div>\n          <div class="panel-body" data-subtab="spigot">\n            <div class="form-group">\n              <label for="'),__append(idPrefix),__append('-rearmDowntimeReason">'),__append(t("production","settings:rearmDowntimeReason")),__append('</label>\n              <input id="'),__append(idPrefix),__append('-rearmDowntimeReason" name="production.rearmDowntimeReason" type="text" data-setting>\n            </div>\n            <div class="form-group">\n              <label for="'),__append(idPrefix),__append('-spigotLines">'),__append(t("production","settings:spigotLines")),__append('</label>\n              <input id="'),__append(idPrefix),__append('-spigotLines" name="production.spigotLines" type="text" data-setting>\n            </div>\n            <div class="checkbox">\n              <label class="control-label">\n                <input id="'),__append(idPrefix),__append('-spigotFinish" name="production.spigotFinish" type="checkbox" value="true">\n                '),__append(t("production","settings:spigotFinish")),__append('\n              </label>\n            </div>\n            <div class="form-group">\n              <label for="'),__append(idPrefix),__append('-spigotPatterns">'),__append(t("production","settings:spigotPatterns")),__append('</label>\n              <textarea id="'),__append(idPrefix),__append('-spigotPatterns" name="production.spigotPatterns" class="form-control text-mono" rows="4"></textarea>\n            </div>\n            <div class="form-group">\n              <label for="'),__append(idPrefix),__append('-spigotNotPatterns">'),__append(t("production","settings:spigotNotPatterns")),__append('</label>\n              <textarea id="'),__append(idPrefix),__append('-spigotNotPatterns" name="production.spigotNotPatterns" class="form-control text-mono" rows="4"></textarea>\n            </div>\n            <div class="form-group">\n              <label for="'),__append(idPrefix),__append('-spigotGroups">'),__append(t("production","settings:spigotGroups")),__append('</label>\n              <textarea id="'),__append(idPrefix),__append('-spigotGroups" name="production.spigotGroups" class="form-control text-mono" rows="7" data-keyup-delay="2000"></textarea>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</form>\n');return __output.join("")}});