#!/bin/sh

PRODLINE=$(zenity --forms --title="Konfiguracja przegladarki WMES" \
	--text="Podaj ID Linii produkcyjnej" \
	--add-entry="Linia produkcyjna" )

if [ -z $PRODLINE ]
then
	zenity --info --text="ID Linii produkcyjnej jest wymagane!"
	exit 1
fi

SHORTCUT="
#!/usr/bin/env xdg-open\n
[Desktop Entry]\n
Version=1.0\n
Terminal=false\n
Type=Application\n
Name=Operator WMES\n
Exec=$HOME/wmes-operator.sh "$PRODLINE"\n
Icon=$HOME/wmes-operator.ico\n
StartupWMClass=OperatorWMES\n
"

echo -e $SHORTCUT > $HOME/Desktop/wmes-operator.desktop
chmod +x $HOME/wmes-operator.sh $HOME/Desktop/wmes-operator.desktop
echo $PRODLINE > $HOME/wmes-prodLine.txt

zenity --info --text="Dodano wpis do przegladarki:\n\nLinia: $PRODLINE\nKomputer: $HOSTNAME"
exit 0
