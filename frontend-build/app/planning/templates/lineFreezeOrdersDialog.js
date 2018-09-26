define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="planning-freezeOrders">\n  <div class="row">\n    <div class="col-md-4 form-group">\n      <label class="control-label">'),__append(t("planning","lines:menu:freezeOrders:line")),__append('</label>\n      <p class="form-control-static">'),__append(escapeFn(line)),__append('</p>\n    </div>\n    <div class="col-md-8">\n      <div class="btn-group">\n        '),[1,2,3].forEach(function(n){__append('\n        <button type="button" class="btn btn-default" data-shift="'),__append(n),__append('">\n          '),__append(t("planning","lines:menu:freezeOrders:shift:"+n)),__append("\n        </button>\n        ")}),__append('\n      </div>\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-availableOrders" class="control-label">'),__append(t("planning","lines:menu:freezeOrders:availableOrders")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-availableOrders" type="text" autocomplete="new-password" value="">\n  </div>\n  <table class="table table-condensed table-hover">\n    <thead>\n    <tr>\n      <th class="is-min">'),__append(t("planning","lines:menu:freezeOrders:no")),__append("</th>\n      <th>"),__append(t("planning","lines:menu:freezeOrders:order")),__append('</th>\n      <th class="is-min">'),__append(t("planning","lines:menu:freezeOrders:quantity")),__append('</th>\n      <th class="is-min actions">'),__append(t("planning","lines:menu:freezeOrders:actions")),__append('</th>\n    </tr>\n    </thead>\n    <tbody id="'),__append(idPrefix),__append('-frozenOrders">\n    <tr>\n      <td class="is-min text-right"></td>\n      <td class="planning-freezeOrders-order">\n        <input name="frozenOrders[].orderNo" type="hidden">\n        <span></span>\n      </td>\n      <td class="is-min"><input class="form-control no-controls planning-freezeOrders-quantity" name="frozenOrders[].quantity" type="number" min="1" max="999"></td>\n      <td class="actions">\n        <div class="actions-group">\n          <button data-action="up" class="btn btn-default" type="button"><i class="fa fa-arrow-up"></i></button>\n          <button data-action="down" class="btn btn-default" type="button"><i class="fa fa-arrow-down"></i></button>\n          <button data-action="remove" class="btn btn-default" type="button"><i class="fa fa-remove"></i></button>\n        </div>\n      </td>\n    </tr>\n    </tbody>\n  </table>\n  <div class="form-actions">\n    <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-primary">\n      <span class="fa fa-spinner fa-spin hidden"></span>\n      <span>'),__append(t("planning","lines:menu:freezeOrders:submit")),__append('</span>\n    </button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});