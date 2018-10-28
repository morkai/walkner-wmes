define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(a){return _ENCODE_HTML_RULES[a]||a}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form>\n  <div class="paintShop-datePicker-input">\n    <input id="'),__append(idPrefix),__append('-day" name="day" class="form-control" value="'),__append(day),__append('" pattern="^[0-9]{1,2}$" maxlength="2" required placeholder="'),__append(t("paintShop","datePicker:placeholder:day")),__append('" data-vkb="numeric" min="1" max="31">\n    <span class="paintShop-datePicker-separator">-</span>\n    <input id="'),__append(idPrefix),__append('-month" name="month" class="form-control" value="'),__append(month),__append('" pattern="^[0-9]{1,2}$" maxlength="2" required placeholder="'),__append(t("paintShop","datePicker:placeholder:month")),__append('" data-vkb="numeric" min="1" max="12">\n    <span class="paintShop-datePicker-separator">-</span>\n    <input id="'),__append(idPrefix),__append('-year" name="year" class="form-control" value="'),__append(year),__append('" pattern="^[0-9]{4}$" maxlength="4" required placeholder="'),__append(t("paintShop","datePicker:placeholder:year")),__append('" data-vkb="numeric" min="2017" max="2100">\n  </div>\n  <div class="paintShop-datePicker-buttons">\n    <button class="btn btn-default" type="button" data-days="-2">'),__append(t("paintShop","datePicker:d-2")),__append('</button>\n    <button class="btn btn-default" type="button" data-days="-1">'),__append(t("paintShop","datePicker:d-1")),__append('</button>\n    <button class="btn btn-default" type="button" data-days="0">'),__append(t("paintShop","datePicker:d0")),__append('</button>\n    <button class="btn btn-default" type="button" data-days="1">'),__append(t("paintShop","datePicker:d+1")),__append('</button>\n    <button class="btn btn-default" type="button" data-days="2">'),__append(t("paintShop","datePicker:d+2")),__append('</button>\n    <button class="btn btn-primary">'),__append(t("paintShop","datePicker:submit")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});