define(["../router","../viewport","../user"],function(e,p,n){"use strict";e.map("/help",n.auth("LOCAL","USER"),function(e){p.loadPage(["app/help/pages/HelpPage","css!app/help/assets/main","i18n!app/nls/help"],function(p){return new p({file:e.query.file})})})});