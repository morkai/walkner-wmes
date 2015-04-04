// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/broker","app/core/Viewport"],function(e,o){"use strict";var r=new o({el:document.body,selector:"#app-viewport"});return e.subscribe("router.executing",function(){window.scrollTo(0,0)}),window.viewport=r,r});