#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include "_Common.au3"

$outputPath = ReadIni("T_ZOPP", "OutputPath", ReadIni("Transactions", "OutputPath", "C:\SAP\Output"))
$outputFile = ReadIni("T_ZOPP", "OutputFile", "T_ZOPP.txt")
$codePage = ReadIni("T_ZOPP", "OutputEncoding", ReadIni("Transactions", "OutputEncoding", "4110"))
$variant = ReadIni("T_ZOPP", "Variant", "")
$variantCreator = ReadIni("T_ZOPP", "VariantCreator", ReadIni("Transactions", "VariantCreator", ""))
$pOrg = ReadIni("T_ZOPP", "POrg", "")

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug("T_ZOPP.exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --output-path")
  LogDebug("  --output-file")
  LogDebug("  --code-page")
  LogDebug("  --variant")
  LogDebug("  --variant-creator")
  LogDebug("  --p-org")
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
      Case "--variant"
        $variant = $v
      Case "--variant-creator"
        $variantCreator = $v
      case "--p-org"
        $pOrg = $v
    EndSwitch
  Next
EndIf

LogDebug("T_ZOPP")
LogDebug("--output-path=" & $outputPath)
LogDebug("--output-file=" & $outputFile)
LogDebug("--code-page=" & $codePage)
LogDebug("--variant=" & $variant)
LogDebug("--variant-creator=" & $variantCreator)
LogDebug("--p-org=" & $pOrg)

#include "_Logon.au3"

StartTransaction("ZOPP")

SetVariant($session, $variant, $variantCreator)

; Set purchasing organization
If $pOrg <> "" Then
  $session.FindById("wnd[0]/usr/tabsTABSTRIP_MYTAB/tabpPUSH1/ssub%_SUBSCREEN_MYTAB:ZOPPURCH:0100/ctxtS_EKORG-LOW").Text = $pOrg
EndIf

; Execute
$session.FindById("wnd[0]/tbar[1]/btn[8]").Press()

; Save to file (replace)
$session.FindById("wnd[0]/mbar/menu[0]/menu[5]/menu[2]/menu[2]").Select()
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
