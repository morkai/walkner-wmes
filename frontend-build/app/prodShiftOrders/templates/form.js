define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="prodShiftOrders-form" method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(escapeFn(formMethod)),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append("</div>\n    "),isChangeRequest&&(__append('\n    <div class="message message-inline message-warning">'),__append(t("prodShiftOrders","changeRequest:warning:"+(editMode?"edit":"add"))),__append("</div>\n    ")),__append('\n    <div class="panel-body">\n      '),isChangeRequest&&(__append('\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-requestComment" class="control-label">'),__append(t("prodShiftOrders","changeRequest:commentLabel")),__append('</label>\n        <textarea id="'),__append(idPrefix),__append('-requestComment" class="form-control" name="requestComment" rows="2"></textarea>\n      </div>\n      ')),__append('\n      <div class="row">\n        <div class="form-group col-md-4">\n          <label for="'),__append(idPrefix),__append('-master" class="control-label">'),__append(t("prodShiftOrders","PROPERTY:master")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-master" type="text" autocomplete="new-password" name="master">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__append(idPrefix),__append('-leader" class="control-label">'),__append(t("prodShiftOrders","PROPERTY:leader")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-leader" type="text" autocomplete="new-password" name="leader">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__append(idPrefix),__append('-operator" class="control-label">'),__append(t("prodShiftOrders","PROPERTY:operator")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-operator" type="text" autocomplete="new-password" name="operator">\n        </div>\n      </div>\n      <div class="form-group has-required-select2">\n        <label for="'),__append(idPrefix),__append('-order" class="control-label is-required">'),__append(t("prodShiftOrders","PROPERTY:order")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-order" type="text" autocomplete="new-password" required>\n      </div>\n      <div class="form-group has-required-select2">\n        <label for="'),__append(idPrefix),__append('-operation" class="control-label is-required">'),__append(t("prodShiftOrders","PROPERTY:operation")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-operation" type="text" autocomplete="new-password" required>\n      </div>\n      <div class="row">\n        <div class="form-group col-md-2">\n          <label for="'),__append(idPrefix),__append('-quantityDone" class="control-label is-required">'),__append(t("prodShiftOrders","PROPERTY:quantityDone")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-quantityDone" class="form-control" type="number" name="quantityDone" min="0" required>\n        </div>\n        <div class="form-group col-md-2">\n          <label for="'),__append(idPrefix),__append('-workerCount" class="control-label is-required">'),__append(t("prodShiftOrders","PROPERTY:workerCount")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-workerCount" class="form-control" type="number" name="workerCount" min="1" required>\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-startedAtDate" class="control-label is-required">'),__append(t("prodShiftOrders","PROPERTY:startedAt")),__append('</label>\n        <div class=" form-group-datetime">\n          <input id="'),__append(idPrefix),__append('-startedAtDate" class="form-control" name="startedAtDate" type="date" required>\n          <input id="'),__append(idPrefix),__append('-startedAtTime" class="form-control" name="startedAtTime" type="time" required step="1">\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-finishedAtDate" class="control-label is-required">'),__append(t("prodShiftOrders","PROPERTY:finishedAt")),__append('</label>\n        <div class=" form-group-datetime">\n          <input id="'),__append(idPrefix),__append('-finishedAtDate" class="form-control" name="finishedAtDate" type="date" required>\n          <input id="'),__append(idPrefix),__append('-finishedAtTime" class="form-control" name="finishedAtTime" type="time" required step="1">\n        </div>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});