define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="production-isa-sections">\n  <div class="production-isa-section">\n    <div class="production-isa-status '),__append(pickupIndicatorColor),__append('">\n      <span class="production-isa-status-label">'),__append(pickupStatusLabel),__append('</span>\n    </div>\n    <button id="'),__append(idPrefix),__append('-pickup" class="btn btn-lg btn-block btn-default production-isa-btn '),__append(pickupActive?"active":""),__append('" '),__append(pickupDisabled?"disabled":""),__append(">\n      "),__append(t("production","isa:pickup")),__append('\n    </button>\n  </div>\n  <div class="production-isa-section">\n    <div class="production-isa-status '),__append(deliveryIndicatorColor),__append('">\n      <span class="production-isa-status-label">'),__append(deliveryStatusLabel),__append('</span>\n    </div>\n    <div class="dropup">\n      <button id="'),__append(idPrefix),__append('-deliver" class="btn btn-lg btn-block btn-default production-isa-btn '),__append(deliveryActive?"active":""),__append('" '),__append(deliveryDisabled?"disabled":""),__append(">\n        "),selectedPalletKind?(__append("\n        "),__append(t("production","isa:deliver:specific",{qty:selectedQty,palletKind:selectedPalletKind})),__append("\n        ")):(__append("\n        "),__append(t("production","isa:deliver")),__append("\n        ")),__append("\n      </button>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});