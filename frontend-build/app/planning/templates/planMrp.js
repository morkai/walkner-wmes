define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="planning-mrp">\n  <div id="'),__append(idPrefix),__append('-toolbar"></div>\n  <div class="planning-mrp-hd">\n    <span class="planning-mrp-hd-id">'),__append(escapeFn(mrp.name)),__append('&nbsp;</span>\n    <span class="planning-mrp-hd-name">'),__append(escapeFn(mrp.description)),__append('</span>\n  </div>\n  <div id="'),__append(idPrefix),__append('-messages" class="planning-mrp-messages"></div>\n  <div id="'),__append(idPrefix),__append('-lines" class="planning-mrp-bd"></div>\n  <div id="'),__append(idPrefix),__append('-orders" class="planning-mrp-bd"></div>\n  <div id="'),__append(idPrefix),__append('-lineOrders" class="planning-mrp-bd"></div>\n  <div id="'),__append(idPrefix),__append('-timeline" class="planning-mrp-timeline">\n    <div class="planning-mrp-timeline-h">1</div>\n    <div class="planning-mrp-timeline-h">2</div>\n    <div class="planning-mrp-timeline-h">3</div>\n    <div class="planning-mrp-timeline-h">4</div>\n    <div class="planning-mrp-timeline-h">5</div>\n    <div class="planning-mrp-timeline-h">6</div>\n    <div class="planning-mrp-timeline-h">7</div>\n    <div class="planning-mrp-timeline-h">8</div>\n    <div id="'),__append(idPrefix),__append('-time" class="planning-mrp-timeline-time">00:00:00</div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-crosshair" class="planning-mrp-crosshair"></div>\n</div>\n');return __output.join("")}});