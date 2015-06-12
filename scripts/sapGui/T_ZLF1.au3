#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include "_Common.au3"

$variant = ReadIni("T_ZLF1", "Variant", "")

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug("T_ZLF1.exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --variant")
  Exit(0)
EndIf

If $CmdLine[0] > 0 And Mod($CmdLine[0], 2) = 0 Then
  For $i = 1 To ($CmdLine[0] - 1) Step 2
    $k = $CmdLine[$i]
    $v = $CmdLine[$i + 1]

    Switch $k
      Case "--variant"
        $variant = $v
    EndSwitch
  Next
EndIf

LogDebug("T_ZLF1")
LogDebug("--variant=" & $variant)

#include "_Logon.au3"

LogDebug("STARTING_TRANSATION")

; Start transaction
$session.StartTransaction("ZLF1")

; Set Variant
If $variant <> "" Then
  $session.FindById("wnd[0]/tbar[1]/btn[17]").Press()
  $session.FindById("wnd[1]/usr/txtV-LOW").Text = $variant
  $session.FindById("wnd[1]/tbar[0]/btn[8]").Press()
EndIf

; Execute
$session.FindById("wnd[0]/tbar[1]/btn[8]").Press()

$sbarText = $session.findById("wnd[0]/sbar").Text

; Back to main screen
$session.FindById("wnd[0]/tbar[0]/btn[12]").Press()

LogDebug("ENDING_TRANSACTION")

CloseSession()

If $sbarText <> "" Then
  LogDebug('"' & $sbarText & '"')
  LogError("ERR_NON_EMPTY_SBAR", $ERR_NON_EMPTY_SBAR)
EndIf
