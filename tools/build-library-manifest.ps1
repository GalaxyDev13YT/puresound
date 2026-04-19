param(
  [string]$ApiKey = "",
  [string]$RootFolderId = "1eBXiNU5vMlK67JELspL6_QCVQBDSwDJ2",
  [string]$Referrer = "https://galaxydevvv.github.io/puresound/",
  [string]$OutputPath = "../library.json"
)

$ErrorActionPreference = "Stop"

function Get-ConfigValue {
  param(
    [string]$Path,
    [string]$Pattern
  )
  if (-not (Test-Path $Path)) { return "" }
  $text = Get-Content -Raw $Path
  $match = [regex]::Match($text, $Pattern)
  if ($match.Success) { return $match.Groups[1].Value }
  return ""
}

if (-not $ApiKey) {
  $configPath = Join-Path $PSScriptRoot '..\config.js'
  $ApiKey = Get-ConfigValue -Path $configPath -Pattern 'apiKey:\s*"([^"]+)"'
}

if (-not $ApiKey) {
  throw "No API key found. Pass -ApiKey or set directBrowser.apiKey in config.js."
}

function Get-DriveItems {
  param([string]$ParentId)

  $files = @()
  $pageToken = $null
  do {
    $params = [ordered]@{
      q = "'$ParentId' in parents and trashed = false"
      pageSize = '1000'
      fields = 'nextPageToken,files(id,name,mimeType,size,resourceKey,webContentLink,shortcutDetails(targetId,targetMimeType,targetResourceKey))'
      supportsAllDrives = 'true'
      includeItemsFromAllDrives = 'true'
      key = $ApiKey
    }
    if ($pageToken) { $params.pageToken = $pageToken }
    $uri = 'https://www.googleapis.com/drive/v3/files?' + (($params.GetEnumerator() | ForEach-Object {
      "{0}={1}" -f [uri]::EscapeDataString($_.Key), [uri]::EscapeDataString([string]$_.Value)
    }) -join '&')

    $response = Invoke-WebRequest -Uri $uri -Headers @{ Referer = $Referrer; Origin = ([uri]$Referrer).GetLeftPart([System.UriPartial]::Authority) } -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    $files += @($data.files)
    $pageToken = $data.nextPageToken
  } while ($pageToken)

  return $files
}

$rootItems = @(Get-DriveItems -ParentId $RootFolderId)
$folderItems = [ordered]@{}
$folders = $rootItems | Where-Object { $_.mimeType -eq 'application/vnd.google-apps.folder' }
foreach ($folder in $folders) {
  $folderItems[$folder.id] = @(Get-DriveItems -ParentId $folder.id)
}

$payload = [ordered]@{
  generatedAt = (Get-Date).ToString('o')
  rootFolderId = $RootFolderId
  rootItems = $rootItems
  folderItems = $folderItems
}

$resolvedOutput = Resolve-Path (Join-Path $PSScriptRoot $OutputPath) -ErrorAction SilentlyContinue
if (-not $resolvedOutput) {
  $target = Join-Path $PSScriptRoot $OutputPath
} else {
  $target = $resolvedOutput.Path
}
$payload | ConvertTo-Json -Depth 8 | Set-Content -Path $target -Encoding utf8
Write-Host "Wrote manifest to $target"


