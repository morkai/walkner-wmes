define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="factoryLayout-canvas-container">\n  <div class="factoryLayout-toolbar" role="toolbar">\n    <div class="btn-group-vertical">\n      <button type="button" class="btn btn-default" data-action="pan"><span class="shortcut">P</span><i class="fa fa-hand-o-up"></i></button>\n    </div>\n    <div class="btn-group-vertical">\n      <button type="button" class="btn btn-default" data-action="drag"><span class="shortcut">M</span><i class="fa fa-arrows"></i></button>\n      <button type="button" class="btn btn-default" data-action="resize"><span class="shortcut">R</span><i class="fa fa-expand"></i></button>\n    </div>\n  </div>\n  <svg xmlns="http://www.w3.org/2000/svg" version="1.1">\n    <defs>\n      <linearGradient id="factoryLayout-prodLine-bg" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0%" stop-color="#ddd"/>\n        <stop offset="100%" stop-color="#999"/>\n      </linearGradient>\n      <linearGradient id="factoryLayout-prodLine-bg-idle" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0%" stop-color="#FFC864"/>\n        <stop offset="100%" stop-color="#F0AD4E"/>\n      </linearGradient>\n      <linearGradient id="factoryLayout-prodLine-bg-working" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0%" stop-color="#82DC82"/>\n        <stop offset="100%" stop-color="#5CB85C"/>\n      </linearGradient>\n      <linearGradient id="factoryLayout-prodLine-bg-downtime" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0%" stop-color="#FF7672"/>\n        <stop offset="100%" stop-color="#D9534F"/>\n      </linearGradient>\n      <linearGradient id="factoryLayout-metric-bg" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0" stop-color="#fff"/>\n        <stop offset="100%" stop-color="#ddd"/>\n      </linearGradient>\n      <linearGradient id="factoryLayout-metric-bg" x1="0" x2="0" y1="0" y2="1">\n        <stop offset="0" stop-color="#fff"/>\n        <stop offset="100%" stop-color="#ddd"/>\n      </linearGradient>\n    </defs>\n  </svg>\n</div>\n')}();return buf.join("")}});