define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(t){return _ENCODE_HTML_RULES[t]||t}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="orderDocuments-localOrderPicker '),__append(touch?"is-touch":""),__append('" autocomplete="off">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-orderNo" class="control-label is-required">'),__append(t("orderDocuments","localOrderPicker:orderNo")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-orderNo" name="orderNo" class="form-control" type="text" autocomplete="new-password" required maxlength="15" pattern="^([0-9]{9}|[0-9]{15})$" autofocus>\n  </div>\n  <div class="row">\n    <div class="col-md-6 orderDocuments-localOrderPicker-numpad">\n      '),function(){__append('<div id="'),__append(idPrefix),__append('-numpad" class="orderDocuments-numpad">\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="1">1</button>\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="2">2</button>\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="3">3</button>\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="4">4</button>\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="5">5</button>\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="6">6</button>\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="7">7</button>\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="8">8</button>\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="9">9</button>\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="LEFT">&lt;</button>\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="0">0</button>\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="RIGHT">&gt;</button>\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="BACKSPACE"><i class="fa fa-long-arrow-left"></i></button>\n  <button type="button" class="btn btn-default" tabindex="-1" disabled></button>\n  <button type="button" class="btn btn-default" tabindex="-1" data-key="CLEAR"><i class="fa fa-eraser"></i></button>\n</div>\n')}.call(this),__append('\n    </div>\n    <div id="'),__append(idPrefix),__append('-plannedOrders" class="col-md-3 orderDocuments-localOrderPicker-plannedOrders">\n      <label class="control-label">'),__append(t("orderDocuments","localOrderPicker:plannedOrders")),__append('</label>\n      <i class="fa fa-spinner fa-spin"></i>\n    </div>\n    <div id="'),__append(idPrefix),__append('-lastOrders" class="col-md-3 orderDocuments-localOrderPicker-lastOrders">\n      <label class="control-label">'),__append(t("orderDocuments","localOrderPicker:lastOrders")),__append('</label>\n      <i class="fa fa-spinner fa-spin"></i>\n    </div>\n  </div>\n  <div class="form-actions">\n    <button id="'),__append(idPrefix),__append('-submit" class="btn btn-primary '),__append(touch?"btn-lg":""),__append('" type="submit"><i class="fa fa-search"></i><span>'),__append(t("orderDocuments","localOrderPicker:submit")),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});