define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="production-newOrderPicker">\n  '),replacingOrder&&(__append('\n  <p class="message message-inline message-warning">'),__append(t("production","newOrderPicker:checkData:warning")),__append("</p>\n  "),spigot&&(__append('\n  <div id="'),__append(idPrefix),__append('-spigot" class="form-group">\n    <label for="'),__append(idPrefix),__append('-spigot-nc12">'),__append(t("production","endWorkDialog:spigot:nc12")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-spigot-nc12" class="form-control production-spigot-nc12 '),__append(embedded?"is-embedded":""),__append('" type="text" autocomplete="new-password" value="" placeholder="'),__append(t("production","endWorkDialog:spigot:placeholder")),__append('" autofocus required>\n  </div>\n  ')),__append('\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-quantityDone">'),__append(t("production","newOrderPicker:quantityDone")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-quantityDone" class="form-control small '),__append(embedded?"is-embedded":""),__append('" type="'),__append(embedded?"text":"number"),__append('" value="'),__append(quantityDone),__append('" '),__append(spigot?"":"autofocus"),__append(' min="0" max="'),__append(maxQuantityDone),__append('" pattern="^[0-9]{1,3}$" data-ignore-key="1" data-vkb="numeric">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-workerCount">'),__append(t("production","newOrderPicker:workerCount")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-workerCount" class="form-control small '),__append(embedded?"is-embedded":""),__append('" type="'),__append(embedded?"text":"number"),__append('" value="'),__append(workerCount),__append('" min="1" max="'),__append(maxWorkerCount),__append('" pattern="^[0-9]{1,2}$" data-ignore-key="1" data-vkb="numeric">\n  </div>\n  <div id="'),__append(idPrefix),__append('-ft" class="hidden" style="margin-bottom: 15px">\n    <p class="message message-inline message-error">'),__append(t("production","ft:warning")),__append('</p>\n    <div class="form-group">\n      <label for="'),__append(idPrefix),__append('-ft-login">'),__append(t("production","ft:login")),__append('</label>\n      <input id="'),__append(idPrefix),__append('-ft-login" class="form-control is-embedded" type="text" required data-ignore-key="1" data-vkb="alpha numeric">\n    </div>\n    <div class="form-group">\n      <label for="'),__append(idPrefix),__append('-ft-password">'),__append(t("production","ft:password")),__append('</label>\n      <input id="'),__append(idPrefix),__append('-ft-password" class="form-control is-embedded" type="password" required autocomplete="new-password" data-ignore-key="1" data-vkb="alpha numeric extended">\n    </div>\n  </div>\n  <div class="modal-header">\n    <h3 class="modal-title">'),__append(t("production","newOrderPicker:title")),__append("</h3>\n  </div>\n  ")),__append("\n  "),correctingOrder||(__append("\n  "),offline?(__append('\n  <p class="message message-inline message-warning">'),__append(t("production","newOrderPicker:offline:warning:"+orderIdType)),__append("</p>\n  ")):(__append('\n  <p class="message message-inline message-info">'),__append(t("production","newOrderPicker:online:info:"+orderIdType)),__append("</p>\n  ")),__append("\n  ")),__append("\n  "),correctingOrder||!embedded?(__append('\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-order">'),__append(t("production","newOrderPicker:order:label:"+orderIdType)),__append('</label>\n    <input id="'),__append(idPrefix),__append('-order" class="form-control '),__append(embedded?"is-embedded":""),__append('" type="text" autocomplete="new-password" placeholder="'),__append(orderPlaceholder),__append('" maxlength="'),__append(orderMaxLength),__append('" data-ignore-key="1" data-vkb="numeric" '),__append(embedded||offline?"required":""),__append(">\n  </div>\n  ")):(__append('\n  <div class="production-newOrderPicker-row">\n    <div class="form-group">\n      <label for="'),__append(idPrefix),__append('-order">'),__append(t("production","newOrderPicker:order:label:"+orderIdType)),__append('</label>\n      <input id="'),__append(idPrefix),__append('-order" class="form-control '),__append(embedded?"is-embedded":""),__append('" type="text" autocomplete="new-password" placeholder="'),__append(orderPlaceholder),__append('" maxlength="'),__append(orderMaxLength),__append('" data-ignore-key="1" data-vkb="numeric" '),__append(embedded||offline?"required":""),__append('>\n    </div>\n    <div class="form-group">\n      <label for="'),__append(idPrefix),__append('-newWorkerCount">'),__append(t("production","newOrderPicker:newWorkerCount")),__append('</label>\n      <input id="'),__append(idPrefix),__append('-newWorkerCount" class="form-control '),__append(embedded?"is-embedded":""),__append('" type="text" autocomplete="new-password" maxlength="2" min="1" max="15" data-ignore-key="1" data-vkb="numeric" required>\n    </div>\n  </div>\n  ')),__append("\n  "),!offline&&embedded?(__append('\n  <div id="'),__append(idPrefix),__append('-operationGroup" class="production-form-btn-group">\n    <label>'),__append(t("production","newOrderPicker:operation:label:online")),__append('</label>\n    <div class="btn-group-vertical"><p>'),__append(t("production","newOrderPicker:order:tooShort")),__append("</p></div>\n  </div>\n  ")):(__append('\n  <div id="'),__append(idPrefix),__append('-operationGroup" class="form-group">\n    <label for="'),__append(idPrefix),__append('-operation">'),__append(t("production","newOrderPicker:operation:label:"+(offline?"offline":"online"))),__append('</label>\n    <input id="'),__append(idPrefix),__append('-operation" class="form-control '),__append(embedded?"is-embedded":""),__append('" type="text" autocomplete="new-password" placeholder="'),__append(operationPlaceholder),__append('" maxlength="4" pattern="^[0-9]+$" data-ignore-key="1" data-vkb="numeric">\n  </div>\n  ')),__append('\n  <div class="form-actions">\n    <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-lg btn-success">\n      '),__append(submitLabel),__append('\n    </button>\n    <button type="button" class="cancel btn btn-lg btn-link">'),__append(t("production","newOrderPicker:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});