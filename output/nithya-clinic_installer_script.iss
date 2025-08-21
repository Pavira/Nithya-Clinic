[Setup]
AppName=Nithya Clinic
AppVersion=1.0
DefaultDirName={userappdata}\Nithya-Clinic
DefaultGroupName=Nithya Clinic
UninstallDisplayIcon={app}\Nithya-Clinic.exe
OutputDir=.
OutputBaseFilename=Nithya-Clinic-Setup
Compression=lzma
SolidCompression=yes
SetupIconFile=nithya-clinic.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "Nithya-Clinic.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Nithya Clinic"; Filename: "{app}\Nithya-Clinic.exe"
Name: "{userdesktop}\Nithya Clinic"; Filename: "{app}\Nithya-Clinic.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"

[Run]
Filename: "{app}\Nithya-Clinic.exe"; Description: "Launch Nithya Clinic"; Flags: nowait postinstall skipifsilent
