# PowerShell

## 查看近期开关机事件
```pwsh
Get-WinEvent -Oldest -FilterHashtable @{ LogName='System'; ProviderName='Microsoft-Windows-Kernel-General'; Id=12,13 }
```
