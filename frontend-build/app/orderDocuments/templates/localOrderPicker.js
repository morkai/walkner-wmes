define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(t){return _ENCODE_HTML_RULES[t]||t}escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="orderDocuments-localOrderPicker" autocomplete="off">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-orderNo" class="control-label is-required">'),__append(t("orderDocuments","localOrderPicker:orderNo")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-orderNo" name="orderNo" class="form-control" type="text" required maxlength="15" pattern="^([0-9]{9}|[0-9]{15})$" autofocus>\n  </div>\n  <div class="row">\n    <div id="'),__append(idPrefix),__append('-numpad" class="col-md-6 orderDocuments-localOrderPicker-numpad">\n      <button type="button" class="btn btn-default" tabindex="-1" data-key="1">1</button>\n      <button type="button" class="btn btn-default" tabindex="-1" data-key="2">2</button>\n      <button type="button" class="btn btn-default" tabindex="-1" data-key="3">3</button>\n      <button type="button" class="btn btn-default" tabindex="-1" data-key="4">4</button>\n      <button type="button" class="btn btn-default" tabindex="-1" data-key="5">5</button>\n      <button type="button" class="btn btn-default" tabindex="-1" data-key="6">6</button>\n      <button type="button" class="btn btn-default" tabindex="-1" data-key="7">7</button>\n      <button type="button" class="btn btn-default" tabindex="-1" data-key="8">8</button>\n      <button type="button" class="btn btn-default" tabindex="-1" data-key="9">9</button>\n      <button type="button" class="btn btn-default" tabindex="-1" data-key="LEFT">&lt;</button>\n      <button type="button" class="btn btn-default" tabindex="-1" data-key="0">0</button>\n      <button type="button" class="btn btn-default" tabindex="-1" data-key="RIGHT">&gt;</button>\n      <button type="button" class="btn btn-default" tabindex="-1" data-key="BACKSPACE">x</button>\n    </div>\n    <div id="'),__append(idPrefix),__append('-lastOrders" class="col-md-6 orderDocuments-localOrderPicker-lastOrders">\n      <i class="fa fa-spinner fa-spin"></i>\n    </div>\n  </div>\n  <div class="form-actions">\n    <button id="'),__append(idPrefix),__append('-submit" class="btn btn-primary" type="submit"><i class="fa fa-search"></i><span>'),__append(t("orderDocuments","localOrderPicker:submit")),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});