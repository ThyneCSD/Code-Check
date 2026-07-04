$token = "YOUR_GITHUB_TOKEN"
$headers = @{ Authorization = "token $token"; Accept = "application/vnd.github+json" }
$body = @{ name = "code-checker"; private = $false; description = "Simple code verification site" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "https://api.github.com/user/repos" -Headers $headers -Body $body -ContentType "application/json"
