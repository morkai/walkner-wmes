#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include "_Common.au3"

$outputPath = ReadIni("T_GENERIC_LIST", "OutputPath", ReadIni("Transactions", "OutputPath", "C:\SAP\Output"))
$outputFile = ReadIni("T_GENERIC_LIST", "OutputFile", "T_GENERIC_LIST.txt")
$codePage = ReadIni("T_GENERIC_LIST", "OutputEncoding", ReadIni("Transactions", "OutputEncoding", "4110"))
$transaction = ReadIni("T_GENERIC_LIST", "Transaction", "")
$variant = ReadIni("T_GENERIC_LIST", "Variant", "")
$variantCreator = ReadIni("T_GENERIC_LIST", "VariantCreator", ReadIni("Transactions", "VariantCreator", ""))

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug("T_GENERIC_LIST.exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --output-path")
  LogDebug("  --output-file")
  LogDebug("  --code-page")
  LogDebug("  --transaction")
  LogDebug("  --variant")
  LogDebug("  --variant-creator")
  Exit(0)
EndIf

If $CmdLine[0] > 0 And Mod($CmdLine[0], 2) = 0 Then
  For $i = 1 To ($CmdLine[0] - 1) Step 2
    $k = $CmdLine[$i]
    $v = $CmdLine[$i + 1]

    Switch $k
      Case "--output-path"
        $outputPath = $v
      Case "--output-file"
        $outputFile = $v
      Case "--code-page"
        $codePage = $v
      Case "--transaction"
        $transaction = $v
      Case "--variant"
        $variant = $v
      Case "--variant-creator"
        $variantCreator = $v
    EndSwitch
  Next
EndIf

LogDebug("T_GENERIC_LIST")
LogDebug("--output-path=" & $outputPath)
LogDebug("--output-file=" & $outputFile)
LogDebug("--code-page=" & $codePage)
LogDebug("--transaction=" & $transaction)
LogDebug("--variant=" & $variant)
LogDebug("--variant-creator=" & $variantCreator)

#include "_Logon.au3"

StartTransaction($transaction)

SetVariant($session, $variant, $variantCreator)

; Execute
$session.FindById("wnd[0]/tbar[1]/btn[8]").Press()

; Save to file (replace)
$session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell").pressToolbarButton("&NAVIGATION_PROFILE_TOOLBAR_EXPAND")
$session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell").pressToolbarContextButton("&MB_EXPORT")
$session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell").selectContextMenuItem("&PC")
$session.FindById("wnd[1]/tbar[0]/btn[0]").Press()
$session.FindById("wnd[1]/usr/ctxtDY_PATH").Text = $outputPath
$session.FindById("wnd[1]/usr/ctxtDY_FILENAME").Text = $outputFile
$session.FindById("wnd[1]/usr/ctxtDY_FILE_ENCODING").Text = $codePage
$session.FindById("wnd[1]/tbar[0]/btn[11]").Press()

; Back to main screen
$session.FindById("wnd[0]/tbar[0]/btn[15]").Press()
$session.FindById("wnd[0]/tbar[0]/btn[15]").Press()

LogDebug("ENDING_TRANSACTION")

CloseSession()
