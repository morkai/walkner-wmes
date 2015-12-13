define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="production-newOrderPicker">\n  '),replacingOrder&&(__append('\n  <p class="message message-inline message-warning">'),__append(t("production","newOrderPicker:checkData:warning")),__append('</p>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-quantityDone">'),__append(t("production","newOrderPicker:quantityDone")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-quantityDone" class="form-control small" type="number" value="'),__append(quantityDone),__append('" autofocus min="0" max="'),__append(maxQuantityDone),__append('">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-workerCount">'),__append(t("production","newOrderPicker:workerCount")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-workerCount" class="form-control small" type="number" value="'),__append(workerCount),__append('" min="1" max="'),__append(maxWorkerCount),__append('">\n  </div>\n  <div class="modal-header">\n    <h3 class="modal-title">'),__append(t("production","newOrderPicker:title")),__append("</h3>\n  </div>\n  ")),__append("\n  "),correctingOrder||(__append("\n  "),offline?(__append('\n  <p class="message message-inline message-warning">'),__append(t("production","newOrderPicker:offline:warning:"+orderIdType)),__append("</p>\n  ")):(__append('\n  <p class="message message-inline message-info">'),__append(t("production","newOrderPicker:online:info:"+orderIdType)),__append("</p>\n  ")),__append("\n  ")),__append('\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-order">'),__append(t("production","newOrderPicker:order:label")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-order" class="form-control" type="text" placeholder="'),__append(t("production","newOrderPicker:order:placeholder:"+orderIdType)),__append('">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-operation">'),__append(t("production","newOrderPicker:operation:label")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-operation" class="form-control" type="text" placeholder="'),__append(t("production","newOrderPicker:offline:operation:placeholder")),__append('" maxlength="4" pattern="^[0-9]+$">\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-'),__append(correctingOrder?"primary":"success"),__append('">\n      '),__append(t("production","newOrderPicker:submit"+(replacingOrder?":replacing":correctingOrder?":correcting":""))),__append('\n    </button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("production","newOrderPicker:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});