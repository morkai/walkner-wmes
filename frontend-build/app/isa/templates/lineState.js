define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(a){return _ENCODE_HTML_RULES[a]||a}escape=escape||function(a){return void 0==a?"":String(a).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="isa-lineState" data-id="'),__append(lineState._id),__append('" data-request-type="'),__append(lineState.requestType),__append('" style="'),__append(hidden?"display: none":""),__append('">\n  <div class="isa-lineState-requestType"></div>\n  <div class="isa-lineState-info">\n    <h1 class="isa-lineState-header">\n      <span class="text-nowrap">'),__append(escape(lineState.orgUnits.prodLine)),__append(':</span>\n      <span class="text-nowrap">'),__append(t("isa","lineState:header:"+lineState.requestType,lineState)),__append('</span>\n    </h1>\n    <div class="isa-lineState-props">\n      <div class="isa-lineState-prop">\n        <span class="isa-lineState-prop-name">'),__append(t("isa","lineState:division")),__append('</span>\n        <span class="isa-lineState-prop-value">'),__append(escape(lineState.orgUnits.division)),__append("</span>\n      </div>\n      "),"response"===lineState.status?(__append('\n      <div class="isa-lineState-prop">\n        <span class="isa-lineState-prop-name">'),__append(t("isa","lineState:whman")),__append('</span>\n        <span class="isa-lineState-prop-value">'),__append(escape(lineState.whman)),__append("</span>\n      </div>\n      ")):(__append('\n      <div class="isa-lineState-prop">\n        <span class="isa-lineState-prop-name">'),__append(t("isa","lineState:prodFlow")),__append('</span>\n        <span class="isa-lineState-prop-value">'),__append(escape(lineState.orgUnits.prodFlow)),__append("</span>\n      </div>\n      ")),__append('\n      <div class="isa-lineState-prop">\n        <span class="isa-lineState-prop-name">'),__append(t("isa","lineState:time")),__append('</span>\n        <time class="isa-lineState-prop-value isa-lineState-time" datetime="'),__append(lineState.time.iso),__append('" title="'),__append(lineState.time["long"]),__append('">'),__append(lineState.time.human),__append('</time>\n      </div>\n    </div>\n  </div>\n  <div class="isa-lineState-actions">\n    <button class="btn btn-success isa-lineState-'),__append("request"===lineState.status?"accept":"finish"),__append('" title="'),__append(t("isa","request"===lineState.status?"accept:action":"finish:action")),__append('">\n      <i class="fa fa-check"></i>\n      <span class="isa-lineState-hotkey">'),__append(hotkey),__append('</span>\n    </button>\n    <button class="btn btn-danger isa-lineState-cancel" title="'),__append(t("isa","cancel:action")),__append('">\n      <i class="fa fa-remove"></i>\n      <span class="isa-lineState-hotkey">'),__append(hotkey),__append("</span>\n    </button>\n  </div>\n</div>\n");return __output.join("")}});