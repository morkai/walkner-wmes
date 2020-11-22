#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include "_Common.au3"
#include <String.au3>

Func DumpProps($p, $obj, $props)
  $props = StringSplit($props, " ", 2)

  For $prop in $props
    LogDebug($p & $prop & " = " & Execute("$obj." & $prop))
  Next
EndFunc

Func DumpChildren($parent, $level)
  If Not IsObj($parent) Or Not IsObj($parent.Children) Then
    Return
  EndIf

  $p = _StringRepeat("  ", $level * 2)

  LogDebug($p & "children = " & $parent.Children.Length)

  $p = _StringRepeat("  ", ($level + 1) * 2)

  For $childI = 0 To $parent.Children.Length - 1 Step 1
    $child = $parent.Children($childI)

    LogDebug($p & "i = " & $childI)
    LogDebug($p & "id = " & $child.Id)
    LogDebug($p & "type = " & $child.Type)
    LogDebug($p & "name = " & $child.Name)

    If IsString($child.Text) And $child.Text <> "" Then
      LogDebug($p & "text = " & $child.Text)
    EndIf

    Switch $child.Type
      Case "GuiButton", "GuiTab", "GuiStatusPane", "GuiShell", "GuiContainerShell"
        DumpProps($p, $child, "Tooltip IconName")
      Case "GuiStatusbar"
        DumpProps($p, $child, "Tooltip IconName MessageId MessageType MessageAsPopup MessageNumber MessageParameter")
      Case "GuiLabel"
        DumpProps($p, $child, "DisplayedText RowText Tooltip IconName")
      Case "GuiTextField", "GuiCTextField"
        DumpProps($p, $child, "DisplayedText Tooltip IconName AccText AccTextOnRequest")
    EndSwitch

    DumpChildren($child, $level + 1)
  Next
EndFunc

$wrapper = ObjCreate("SapROTWr.SAPROTWrapper")
$sapgui = $wrapper.GetROTEntry("SAPGUI")

$application = $sapgui.GetScriptingEngine()
$application.AllowSystemMessages = False
$application.HistoryEnabled = False

$connection = $application.Children(0)

For $sessionI = 0 To $connection.Children.Length - 1 Step 1
  $session = $connection.Children($sessionI)

  LogDebug("session:")
  LogDebug("  i = " & $sessionI)
  LogDebug("  busy = " & $session.Busy)

  If $session.Busy Then
    ContinueLoop
  EndIf

  LogDebug("  id = " & $session.Id)

  DumpChildren($session, 0)
Next

