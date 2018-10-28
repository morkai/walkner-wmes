define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="production is-'),__append(locked?"locked":"unlocked"),__append(" "),__append(state?"is-"+state:""),__append(" "),__append(mechOrder?"is-mechOrder":""),__append(' hidden">\n  <div id="'),__append(idPrefix),__append('-controls"></div>\n  <div id="'),__append(idPrefix),__append('-header"></div>\n  <div id="'),__append(idPrefix),__append('-data"></div>\n  <div class="production-ft">\n    <div class="production-downtimes">\n      <h2 id="'),__append(idPrefix),__append('-downtimes-header" class="production-sectionHeader">'),__append(t("production","section:downtimes")),__append('</h2>\n      <div id="'),__append(idPrefix),__append('-downtimes"></div>\n    </div>\n    <div class="production-taktTime">\n      <h2 class="production-sectionHeader">'),__append(t("production","section:taktTime")),__append('</h2>\n      <div id="'),__append(idPrefix),__append('-taktTime"></div>\n    </div>\n    <div class="production-quantities">\n      <h2 class="production-sectionHeader">'),__append(t("production","section:quantities")),__append('</h2>\n      <div id="'),__append(idPrefix),__append('-quantities"></div>\n    </div>\n    <div class="production-isa">\n      <h2 class="production-sectionHeader">'),__append(t("production","isa:header")),__append('</h2>\n      <div id="'),__append(idPrefix),__append('-isa"></div>\n    </div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-currentDowntime" class="production-currentDowntime hidden">\n    <div id="'),__append(idPrefix),__append('-currentDowntime-message" class="production-currentDowntime-message">\n      <div id="'),__append(idPrefix),__append('-currentDowntime-reason"></div>\n      <div id="'),__append(idPrefix),__append('-currentDowntime-aor" class="production-currentDowntime-aor"></div>\n      <div id="'),__append(idPrefix),__append('-currentDowntime-duration" class="production-currentDowntime-duration"></div>\n      <div id="'),__append(idPrefix),__append('-currentDowntime-elapsedTime"></div>\n    </div>\n  </div>\n  '),showBottomControls&&(__append('\n  <div class="production-controls-bottom">\n    <button id="'),__append(idPrefix),__append('-switchApps" class="btn btn-default" title="'),__append(t("production","controls:switchApps")),__append('"><i class="fa fa-window-restore"></i></button>\n    <button id="'),__append(idPrefix),__append('-reboot" class="btn btn-default" title="'),__append(t("production","controls:reboot")),__append('"><i class="fa fa-refresh"></i></button>\n    <button id="'),__append(idPrefix),__append('-shutdown" class="btn btn-default" title="'),__append(t("production","controls:shutdown")),__append('"><i class="fa fa-power-off"></i></button>\n  </div>\n  ')),__append('\n  <div id="'),__append(idPrefix),__append('-snMessage" class="production-snMessage hidden">\n    <p id="'),__append(idPrefix),__append('-snMessage-text" class="production-snMessage-text">Lorem ipsum dolor sit amet...</p>\n    <div class="production-snMessage-props">\n      '),["scannedValue","orderNo","serialNo"].forEach(function(n){__append('\n      <p class="production-snMessage-prop">\n        <span class="production-snMessage-prop-name">'),__append(t("production","snMessage:"+n)),__append('</span>\n        <span id="'),__append(idPrefix),__append("-snMessage-"),__append(n),__append('" class="production-snMessage-prop-value">?</span>\n      </p>\n      ')}),__append('\n    </div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-vkb"></div>\n</div>\n');return __output.join("")}});