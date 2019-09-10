@echo off

set OLD_CD=%CD%
set NEW_CD=%~dp0
set FIX_SCRIPT=%1%
set DB_HOST=%WMES_MONGODB_PRIMARY%
set DB_NAME=walkner-wmes
set AUTH=--authenticationDatabase %DB_NAME% --username %WMES_MONGODB_USER% --password %WMES_MONGODB_PASS%

if [%DB_HOST%] == [] set DB_HOST=localhost
if [%WMES_MONGODB_USER%] == [] set AUTH=

cd %NEW_CD%
call mongo --host %DB_HOST% %AUTH% %DB_NAME% %NEW_CD%fix\%FIX_SCRIPT%.js
cd %OLD_CD%
