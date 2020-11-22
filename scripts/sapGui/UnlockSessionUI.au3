#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include <WinAPI.au3>
#include "_Common.au3"

LogDebug("UnlockSessionUI")

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

If Not IsObj($session) Then
  LogError("ERR_NO_SESSION", $ERR_NO_SESSION)
EndIf

For $sessionI = 1 To ($connection.Children.Length - 1)
  LogDebug("SESSION_INDEX=" & $sessionI)

  $session = $connection.Children($sessionI)

  If Not IsObj($session) Then
    LogDebug("SESSION_NOT_OBJECT")
    ContinueLoop
  EndIf

  If $session.Busy Then
    LogDebug("SESSION_BUSY")
    ContinueLoop
  EndIf

  LogDebug("SESSION_ID=" & $session.Id)

  $session.UnlockSessionUI()
Next

LogDebug("DONE")
