#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include <WinAPI.au3>
#include "_Common.au3"

Unlock()

LogDebug("CHECKING_WRAPPER")

$wrapper = ObjCreate("SapROTWr.SAPROTWrapper")

If Not IsObj($wrapper) Then
  LogError("ERR_NO_ROT_WRAPPER", $ERR_NO_ROT_WRAPPER)
EndIf

LogDebug("CHECKING_SAPGUI")

$sapgui = $wrapper.GetROTEntry("SAPGUI")

If Not IsObj($sapgui) Then
  LogError("ERR_NO_SAPGUI", $ERR_NO_SAPGUI)
EndIf

LogDebug("CHECKING_SCRIPTING_ENGINE")

$application = $sapgui.GetScriptingEngine()

If Not IsObj($application) Then
  LogError("ERR_NO_SCRIPTING_ENGINE", $ERR_NO_SCRIPTING_ENGINE)
EndIf

$application.AllowSystemMessages = False
$application.HistoryEnabled = False

LogDebug("CHECKING_CONNECTION")

$connection = $application.Children(0)

If Not IsObj($connection) Then
  LogError("ERR_NO_CONNECTION", $ERR_NO_CONNECTION)
EndIf

LogDebug("CHECKING_SESSION")

$session = $connection.Children(0)

If IsObj($session) Then
  If $session.IsBusy Then
    LogDebug("BUSY")
    Sleep(1337)
  EndIf

  If Not $session.IsBusy Then
    LogDebug("KEEPING_ALIVE")
    $session.findById("wnd[0]/tbar[0]/btn[80]").press
  EndIf

  Unlock()
  Exit(0)
EndIf

LogDebug("ERR_NO_SESSION")

$pid = ProcessExists("saplogon.exe")

If $pid <> 0 Then
  LogDebug("KILLING_SAPLOGON")
  Run(@ComSpec & " /c taskkill /F /PID " & $pid & " /T", @SystemDir, @SW_HIDE)
  ProcessWait("saplogon.exe", 15)
EndIf

#include "_Logon.au3"

If $session.IsBusy Then
  LogDebug("BUSY")
  Sleep(1337)
EndIf

If Not $session.IsBusy Then
  LogDebug("KEEPING_ALIVE")
  $session.findById("wnd[0]/tbar[0]/btn[80]").press
EndIf

Unlock()
