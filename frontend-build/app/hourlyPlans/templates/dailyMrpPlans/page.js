define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="dailyMrpPlans '),__append(wrap?"wrap":""),__append('">\n  <div id="'),__append(idPrefix),__append('-filter" class="filter-container"></div>\n  <div id="'),__append(idPrefix),__append('-msg-filter" class="message message-inline message-warning hidden">\n    <p>Wybierz datę planu oraz przynajmniej jeden kontroler MRP.</p>\n  </div>\n  <div id="'),__append(idPrefix),__append('-msg-empty" class="message message-inline message-info hidden">\n    <p>\n      Brak planów dla wybranych filtrów. Plany można zaimportować wklejając do strony zawartość arkusza <em>Plan</em>\n      za pomocą kombinacji klawiszy <kbd>CTRL+A</kbd>, <kbd>CTRL+C</kbd> i <kbd>CTRL+V</kbd>\n      lub upuszczając na stronę plik z arkuszem <em>Plan</em>.</p>\n  </div>\n  <div id="'),__append(idPrefix),__append('-plans" class="dailyMrpPlans-container"></div>\n</div>\n');return __output.join("")}});