define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<li class="list-group-item list-group-item-',className,' dashboard-leds-led">\n  <div class="dashboard-leds-status"><i class="fa ',statusIcon,'"></i></div>\n  <div class="dashboard-leds-serialNumber">',serialNumber,'</div>\n  <div class="dashboard-leds-info" title="',escape(name),'">\n    <span class="dashboard-leds-name">',escape(name),'</span>\n    <span class="dashboard-leds-nc12">',escape(nc12),'</span>\n  </div>\n  <div class="dashboard-leds-error">',error,"</div>\n</li>\n")}();return buf.join("")}});