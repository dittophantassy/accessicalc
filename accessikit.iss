; -- accessikit.iss --


[Setup]
AppName=accessikit
AppVersion=1.0
DefaultDirName={pf}\accessikit
DefaultGroupName=accessikit
; Since no icons will be created in "{group}", we don't need the wizard
; to ask for a Start Menu folder name:
UninstallDisplayIcon={app}\accessicalc.exe
OutputDir=userdocs:Inno Setup Examples Output

[Dirs]
Name: "{app}\include"
Name: "{app}\jinja2"
Name: "{app}\markupsafe"
Name: "{app}\static"
Name: "{app}\tabla periodica"
Name: "{app}\tcl"
Name: "{app}\tk"


[Files]

Source: "include\*"; DestDir: "{app}\include"; Flags: recursesubdirs
Source: "jinja2\*"; DestDir: "{app}\jinja2"; Flags: recursesubdirs
Source: "markupsafe\*"; DestDir: "{app}\markupsafe"; Flags: recursesubdirs
Source: "static\*"; DestDir: "{app}\static"; Flags: recursesubdirs
Source: "tabla periodica\*"; DestDir: "{app}\tabla periodica"; Flags: recursesubdirs
Source: "tcl\*"; DestDir: "{app}\tcl"; Flags: recursesubdirs
Source: "tk\*"; DestDir: "{app}\tk"; Flags: recursesubdirs


Source: "accessicalc.exe"; DestDir: "{app}"
Source: "accessicalc.exe.manifest"; DestDir: "{app}"
Source: "bz2.pyd"; DestDir: "{app}"
Source: "Leer.txt"; DestDir: "{app}"; Flags: isreadme
Source: "microsoft.vc90.crt.manifest"; DestDir: "{app}"
Source: "msvcm90.dll"; DestDir: "{app}"
Source: "msvcp90.dll"; DestDir: "{app}"
Source: "msvcr90.dll"; DestDir: "{app}"
Source: "PIL._imaging.pyd"; DestDir: "{app}"
Source: "PIL._imagingtk.pyd"; DestDir: "{app}"
Source: "pyexpat.pyd"; DestDir: "{app}"
Source: "python27.dll"; DestDir: "{app}"
Source: "pywintypes27.dll"; DestDir: "{app}"
Source: "select.pyd"; DestDir: "{app}"
Source: "tcl85.dll"; DestDir: "{app}"
Source: "tk85.dll"; DestDir: "{app}"
Source: "unicodedata.pyd"; DestDir: "{app}"
Source: "win32api.pyd"; DestDir: "{app}"
Source: "win32pipe.pyd"; DestDir: "{app}"
Source: "win32wnet.pyd"; DestDir: "{app}"
Source: "_ctypes.pyd"; DestDir: "{app}"
Source: "_hashlib.pyd"; DestDir: "{app}"
Source: "_socket.pyd"; DestDir: "{app}"
Source: "_ssl.pyd"; DestDir: "{app}"
Source: "_tkinter.pyd"; DestDir: "{app}"


[Icons]
Name: "{group}\accessicalc"; Filename: "{app}\accessicalc.exe"; WorkingDir: "{app}"
Name: "{group}\tabla periodica"; Filename: "{app}\tabla periodica\index.html"
Name: "{group}\desinstalar accessikit"; Filename: "{uninstallexe}"



[Languages]
Name: "es"; MessagesFile: "compiler:Languages\Spanish.isl"