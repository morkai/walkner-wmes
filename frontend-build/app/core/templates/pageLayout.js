define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="page">\n  <div class="hd">\n    <nav class="navbar navbar-default navbar-fixed-top"></nav>\n    <div class="page-alerts"></div>\n    <div class="page-header">\n      <ul class="page-actions"></ul>\n      <ul class="page-breadcrumbs"></ul>\n    </div>\n  </div>\n  <div class="bd"></div>\n  <div class="ft">\n    <p>\n      by <a href="http://walkner.pl/">walkner.pl</a>\n    </p>\n  </div>\n</div>\n')}();return buf.join("")}});