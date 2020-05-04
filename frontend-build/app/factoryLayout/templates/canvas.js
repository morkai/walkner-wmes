define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(t){return _ENCODE_HTML_RULES[t]||t}var __output="";function __append(t){void 0!==t&&null!==t&&(__output+=t)}with(locals||{})__append('<div class="factoryLayout-canvas-container '),__append(editable?"is-editable":""),__append(" "),__append(heff?"is-heff":""),__append('">\n  <div class="factoryLayout-toolbar" role="toolbar">\n    <div class="btn-group-vertical">\n      <button type="button" class="btn btn-default" data-action="pan"><span class="shortcut">P</span><i class="fa fa-hand-o-up"></i></button>\n    </div>\n    <div class="btn-group-vertical">\n      <button type="button" class="btn btn-default" data-action="drag"><span class="shortcut">M</span><i class="fa fa-arrows"></i></button>\n      <button type="button" class="btn btn-default" data-action="resize"><span class="shortcut">R</span><i class="fa fa-expand"></i></button>\n    </div>\n  </div>\n  <svg xmlns="http://www.w3.org/2000/svg" version="1.1">\n    <defs>\n      <linearGradient id="factoryLayout-prodLine-bg" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0%" stop-color="#ddd"/>\n        <stop offset="100%" stop-color="#999"/>\n      </linearGradient>\n      <linearGradient id="factoryLayout-prodLine-bg-idle" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0%" stop-color="#555"/>\n        <stop offset="100%" stop-color="#000"/>\n      </linearGradient>\n      <linearGradient id="factoryLayout-prodLine-bg-working" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0%" stop-color="#82DC82"/>\n        <stop offset="100%" stop-color="#5CB85C"/>\n      </linearGradient>\n      <linearGradient id="factoryLayout-prodLine-bg-working-nok" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0%" stop-color="#FFC864"/>\n        <stop offset="100%" stop-color="#F0AD4E"/>\n      </linearGradient>\n      <linearGradient id="factoryLayout-prodLine-bg-downtime" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0%" stop-color="#FF7672"/>\n        <stop offset="100%" stop-color="#D9534F"/>\n      </linearGradient>\n      <linearGradient id="factoryLayout-prodLine-bg-break" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0%" stop-color="#CD00CD"/>\n        <stop offset="100%" stop-color="#B300B3"/>\n      </linearGradient>\n      <linearGradient id="factoryLayout-metric-bg" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0" stop-color="#fff"/>\n        <stop offset="100%" stop-color="#ddd"/>\n      </linearGradient>\n      <linearGradient id="factoryLayout-metric-bg" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0" stop-color="#fff"/>\n        <stop offset="100%" stop-color="#ddd"/>\n      </linearGradient>\n    </defs>\n  </svg>\n</div>\n');return __output}});