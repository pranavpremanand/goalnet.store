$ErrorActionPreference='Stop'
$base='http://localhost:3000'; $uri=[Uri]$base; $out=@()
function R($s,$m,$p,$b=$null) {
  $q=@{UseBasicParsing=$true;MaximumRedirection=0;Uri=($base+$p);Method=$m;WebSession=$s;TimeoutSec=20}
  if($null -ne $b){$q.Body=$b;$q.ContentType='application/json'}
  try { $x=Invoke-WebRequest @q; return [pscustomobject]@{S=[int]$x.StatusCode;L=$x.Headers.Location;B=[string]$x.Content} }
  catch { $v=$_.Exception.Response; if($v){$z=New-Object IO.StreamReader($v.GetResponseStream());$t=$z.ReadToEnd();$z.Dispose();return [pscustomobject]@{S=[int]$v.StatusCode.value__;L=$v.Headers.Location;B=$t}}; return [pscustomobject]@{S='ERR';L='';B=$_.Exception.Message} }
}
function F($x){if($x.S -match '^30'){return "$($x.S) Location=$($x.L)"};if($x.B -match '(?i)NEXT_REDIRECT|meta[^>]+refresh'){return "$($x.S) streamed-redirect-marker"};return "$($x.S)"}
function A($n,$x,$e){$script:out += [pscustomobject]@{Case=$n;Actual=(F $x);Expected=$e}}
& node route-role.js cleanup
$g=New-Object Microsoft.PowerShell.Commands.WebRequestSession
foreach($p in @('/dashboard/dashboard','/dashboard/my-orders','/admin','/admin/users','/admin/products')){A "A $p" (R $g GET $p) 'redirect'}
foreach($p in @('/admin/login','/login','/signup','/forgot-password','/checkout','/shop','/order-status')){A "A $p" (R $g GET $p) '200'}
$c=New-Object Microsoft.PowerShell.Commands.WebRequestSession;$j='{"name":"Route Tester","email":"route.tester+tmp@example.com","password":"goalnet-fan-2026","acceptTerms":true}'
$x=R $c POST '/api/auth/signup' $j;A 'B signup' $x '200';$x=R $c GET '/dashboard/dashboard';A 'B dashboard' $x '200 body Route/Welcome'
foreach($p in @('/login','/signup')){A "B $p" (R $c GET $p) 'redirect /dashboard/dashboard'};foreach($p in @('/admin','/admin/users')){A "B $p" (R $c GET $p) 'redirect /admin/login'}
$x=R $c POST '/api/auth/admin/signin' '{"email":"route.tester+tmp@example.com","password":"goalnet-fan-2026"}';A 'B admin signin customer' $x '401 Invalid email or password';$x=R $c GET '/api/auth/me';A 'B me' $x '200 customer'
$st=New-Object Microsoft.PowerShell.Commands.WebRequestSession;$st.Cookies.Add($uri,(New-Object Net.Cookie('goalnet_session','bogus','/','localhost')));A 'C stale dashboard' (R $st GET '/dashboard/dashboard') 'redirect /login';A 'C stale login' (R $st GET '/login') '200'
& node route-role.js setup-admin;$a=New-Object Microsoft.PowerShell.Commands.WebRequestSession;$x=R $a POST '/api/auth/admin/signin' '{"email":"route.tester+tmp@example.com","password":"goalnet-fan-2026"}';A 'D admin signin' $x '200 role admin';foreach($p in @('/admin','/admin/users','/dashboard/dashboard')){A "D $p" (R $a GET $p) '200'};A 'D admin login' (R $a GET '/admin/login') 'redirect /admin'
$x=R $g GET '/login?next=//evil.com';A 'E evil next' $x '200 evil.com=False';$x=R $g GET '/login?next=/dashboard/my-orders';A 'E safe next' $x '200'
$out | Format-Table -AutoSize | Out-String -Width 220 | Write-Output
& node route-role.js cleanup
