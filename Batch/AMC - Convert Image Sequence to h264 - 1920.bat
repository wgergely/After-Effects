@echo off
cls

::Parameters
set width=1920
set rate=24

::This setup assumes 4 pads for sequences
set name=%~n1
set input=-i %~dp1%name:~0,-4%%%04d%~x1
set timecode=-vf "drawtext=fontfile='C\:\\Windows\\Fonts\\tahoma.ttf': text=%%{n}: x=(w-tw)/2: y=h-(2*lh): fontcolor=white: fontsize={w/20}:box=1:boxcolor=0x00000099"
set timecode_resize=-vf "[in]drawtext=fontfile='C\:\\Windows\\Fonts\\tahoma.ttf': text=%%{n}: x=(w-tw)/2: y=h-(2*lh): fontcolor=white: fontsize=80: box=1: boxcolor=0x00000099[timecode]; [timecode]scale=%width%:-1[out]"
set resize=-vf "scale=%width%:-1"
set r=-r %rate%
set preset=-c:v libx264 -crf 20 -pix_fmt yuv420p -x264-params keyint=12:min-keyint=4 -x264opts "keyint=12:min-keyint=4:no-scenecut" -preset:v slow -profile:v baseline -level 4.0

::Timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "fullstamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

for %%A in ("%~dp1.") do set grandparent=%%~dpA
set output=%grandparent%%name:~0,-4%%fullstamp%.mp4

ffmpeg -hide_banner -loglevel info %r% -start_number %name:~-4% %input% %r% %timecode_resize% %preset% %output%
start "" explorer "%grandparent%"
start "" explorer "%output%"
exit /b