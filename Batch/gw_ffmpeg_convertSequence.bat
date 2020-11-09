@echo off
cls
set name=%~n1
::assumes 4 pads
set input=-i %~dp1%name:~0,-4%%%04d%~x1
set timecode=-vf "drawtext=fontfile='C\:\\Windows\\Fonts\\tahoma.ttf': text=%%{n}: x=(w-tw)/2: y=h-(2*lh): fontcolor=white: fontsize=20: box=1: boxcolor=0x00000099"
set timecodeAndSize=-vf "[in]drawtext=fontfile='C\:\\Windows\\Fonts\\tahoma.ttf': text=%%{n}: x=(w-tw)/2: y=h-(2*lh): fontcolor=white: fontsize=20: box=1: boxcolor=0x00000099[timecode]; [timecode]scale=960x402[out]"
set rate=-r 24
set preset=-c:v libx264 -crf 20 -pix_fmt yuv420p -x264-params keyint=24:min-keyint=12 -preset:v slow -profile:v baseline -level 3.0
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "fullstamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

for %%A in ("%~dp1.") do set grandparent=%%~dpA
set output=%grandparent%%name:~0,-4%%fullstamp%.mp4

ffmpeg -hide_banner -loglevel info -start_number %name:~-4% %input% %rate% %timecode% %preset% %output%
start "" explorer "%grandparent%"
start "" explorer "%output%"
exit /b