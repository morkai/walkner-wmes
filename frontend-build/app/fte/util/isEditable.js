// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/data/subdivisions"],function(i){return function(e,r){if(r.isAllowedTo("PROD_DATA:MANAGE"))return!0;if(!r.isAllowedTo(e.getPrivilegePrefix()+":MANAGE"))return!1;var t=Date.parse(e.get("createdAt"));if(Date.now()>=t+288e5)return!1;var n=r.getDivision();if(!n||r.isAllowedTo(e.getPrivilegePrefix()+":ALL"))return!0;var o=i.get(e.get("subdivision"));if(!o)return!1;var d=o.get("division");if(!d||n.id!==d)return!1;var u=r.getSubdivision();return u?u.id===o.id:!0}});