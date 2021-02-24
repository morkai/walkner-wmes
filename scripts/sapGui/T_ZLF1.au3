#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include "_Common.au3"

$variant = ReadIni("T_ZLF1", "Variant", "")
$variantCreator = ReadIni("T_ZLF1", "VariantCreator", ReadIni("Transactions", "VariantCreator", ""))

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug("T_ZLF1.exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --variant")
  LogDebug("  --variant-creator")
  Exit(0)
EndIf

If $CmdLine[0] > 0 And Mod($CmdLine[0], 2) = 0 Then
  For $i = 1 To ($CmdLine[0] - 1) Step 2
    $k = $CmdLine[$i]
    $v = $CmdLine[$i + 1]

    Switch $k
      Case "--variant"
        $variant = $v
      Case "--variant-creator"
        $variantCreator = $v
    EndSwitch
  Next
EndIf

LogDebug("T_ZLF1")
LogDebug("--variant=" & $variant)
LogDebug("--variant-creator=" & $variantCreator)

#include "_Logon.au3"

StartTransaction("ZLF1")

SetVariant($session, $variant, $variantCreator)

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
