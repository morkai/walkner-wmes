define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="settings orders-settings">\n  <div class="list-group">\n    <a class="list-group-item" href="#orders;settings?tab=operations" data-tab="operations">'),__append(t("orders","settings:tab:operations")),__append('</a>\n    <a class="list-group-item" href="#orders;settings?tab=documents" data-tab="documents">'),__append(t("orders","settings:tab:documents")),__append('</a>\n    <a class="list-group-item" href="#orders;settings?tab=iptChecker" data-tab="iptChecker">'),__append(t("orders","settings:tab:iptChecker")),__append('</a>\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-body" data-tab="operations">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-operations-groups">'),__append(t("orders","settings:operations:groups")),__append('</label>\n        <span class="help-block">'),__append(t("orders","settings:operations:groups:help")),__append('</span>\n        <textarea id="'),__append(idPrefix),__append('-operations-groups" class="form-control text-mono" name="orders.operations.groups" rows="10" data-keyup-delay="10000" data-change-delay="0"></textarea>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-operations-timeCoeffs">'),__append(t("orders","settings:operations:timeCoeffs")),__append('</label>\n        <span class="help-block">'),__append(t("orders","settings:operations:timeCoeffs:help")),__append('</span>\n        <textarea id="'),__append(idPrefix),__append('-operations-timeCoeffs" class="form-control text-mono" name="orders.operations.timeCoeffs" rows="10" data-keyup-delay="10000" data-change-delay="0"></textarea>\n      </div>\n    </div>\n    <div class="panel-body" data-tab="documents">\n      <div class="checkbox">\n        <label class="control-label">\n          <input id="'),__append(idPrefix),__append('-documents-useCatalog" name="orders.documents.useCatalog" type="checkbox" value="true">\n          '),__append(t("orders","settings:documents:useCatalog")),__append('\n        </label>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-documents-remoteServer">'),__append(t("orders","settings:documents:remoteServer")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-documents-remoteServer" class="form-control" name="orders.documents.remoteServer" type="text" autocomplete="new-password" data-change-delay="0">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-documents-path">'),__append(t("orders","settings:documents:path")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-documents-path" class="form-control" name="orders.documents.path" type="text" autocomplete="new-password" data-change-delay="0">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-documents-extra">'),__append(t("orders","settings:documents:extra")),__append('</label>\n        <textarea id="'),__append(idPrefix),__append('-documents-extra" class="form-control text-mono" name="orders.documents.extra" rows="20" data-keyup-delay="10000" data-change-delay="0"></textarea>\n      </div>\n    </div>\n    <div class="panel-body" data-tab="iptChecker">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-iptChecker-toBusinessDays">'),__append(t("orders","settings:iptChecker:toBusinessDays")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-iptChecker-toBusinessDays" class="form-control" name="orders.iptChecker.toBusinessDays" type="number" min="1" max="9">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-iptChecker-mrps">'),__append(t("orders","settings:iptChecker:mrps")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-iptChecker-mrps" name="orders.iptChecker.mrps" type="text" autocomplete="new-password" data-setting>\n      </div>\n    </div>\n  </div>\n</form>\n');return __output.join("")}});