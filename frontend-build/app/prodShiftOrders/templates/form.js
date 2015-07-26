define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form class="prodShiftOrders-form" method="post" action="'),__output.push(formAction),__output.push('">\n  <input type="hidden" name="_method" value="'),__output.push(escape(formMethod)),__output.push('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__output.push(panelTitleText),__output.push("</div>\n    "),isChangeRequest&&(__output.push('\n    <div class="message message-inline message-warning">'),__output.push(t("prodShiftOrders","changeRequest:warning:"+(editMode?"edit":"add"))),__output.push("</div>\n    ")),__output.push('\n    <div class="panel-body">\n      '),isChangeRequest&&(__output.push('\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-requestComment" class="control-label">'),__output.push(t("prodShiftOrders","changeRequest:commentLabel")),__output.push('</label>\n        <textarea id="'),__output.push(idPrefix),__output.push('-requestComment" class="form-control" name="requestComment" rows="2"></textarea>\n      </div>\n      ')),__output.push('\n      <div class="row">\n        <div class="form-group col-md-4">\n          <label for="'),__output.push(idPrefix),__output.push('-master" class="control-label">'),__output.push(t("prodShiftOrders","PROPERTY:master")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-master" type="text" name="master">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__output.push(idPrefix),__output.push('-leader" class="control-label">'),__output.push(t("prodShiftOrders","PROPERTY:leader")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-leader" type="text" name="leader">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__output.push(idPrefix),__output.push('-operator" class="control-label">'),__output.push(t("prodShiftOrders","PROPERTY:operator")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-operator" type="text" name="operator">\n        </div>\n      </div>\n      <div class="form-group has-required-select2">\n        <label for="'),__output.push(idPrefix),__output.push('-order" class="control-label is-required">'),__output.push(t("prodShiftOrders","PROPERTY:order")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-order" type="text" required>\n      </div>\n      <div class="form-group has-required-select2">\n        <label for="'),__output.push(idPrefix),__output.push('-operation" class="control-label is-required">'),__output.push(t("prodShiftOrders","PROPERTY:operation")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-operation" type="text" required>\n      </div>\n      <div class="row">\n        <div class="form-group col-md-2">\n          <label for="'),__output.push(idPrefix),__output.push('-quantityDone" class="control-label is-required">'),__output.push(t("prodShiftOrders","PROPERTY:quantityDone")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-quantityDone" class="form-control" type="number" name="quantityDone" min="0" required>\n        </div>\n        <div class="form-group col-md-2">\n          <label for="'),__output.push(idPrefix),__output.push('-workerCount" class="control-label is-required">'),__output.push(t("prodShiftOrders","PROPERTY:workerCount")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-workerCount" class="form-control" type="number" name="workerCount" min="1" required>\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-startedAtDate" class="control-label is-required">'),__output.push(t("prodShiftOrders","PROPERTY:startedAt")),__output.push('</label>\n        <div class=" form-group-datetime">\n          <input id="'),__output.push(idPrefix),__output.push('-startedAtDate" class="form-control" name="startedAtDate" type="date" required>\n          <input id="'),__output.push(idPrefix),__output.push('-startedAtTime" class="form-control" name="startedAtTime" type="time" required step="1">\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-finishedAtDate" class="control-label is-required">'),__output.push(t("prodShiftOrders","PROPERTY:finishedAt")),__output.push('</label>\n        <div class=" form-group-datetime">\n          <input id="'),__output.push(idPrefix),__output.push('-finishedAtDate" class="form-control" name="finishedAtDate" type="date" required>\n          <input id="'),__output.push(idPrefix),__output.push('-finishedAtTime" class="form-control" name="finishedAtTime" type="time" required step="1">\n        </div>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__output.push(formActionText),__output.push("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});