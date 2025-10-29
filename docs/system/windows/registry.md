# 注册表
Root keys:
* `HKEY_CLASSES_ROOT` or `HKCR`
* `HKEY_CURRENT_USER` or `HKCU`
* `HKEY_LOCAL_MACHINE` or `HKLM`
* `HKEY_USERS` or `HKU`
* `HKEY_CURRENT_CONFIG` or `HKCC`

参考来源：[Wikipedia: Windows Registry](https://en.wikipedia.org/wiki/Windows_Registry#Root_keys)

## 备份与恢复
建议修改注册表前先进行备份，方便出现问题时手动恢复
* 备份注册表 `Win+R >> regedit >> 文件 >> 导出`
* 恢复注册表 `Win+R >> regedit >> 文件 >> 导入`

参考来源：[Microsoft Support: How to back up and restore the registry in Windows](https://support.microsoft.com/en-us/topic/how-to-back-up-and-restore-the-registry-in-windows-855140ad-e318-2a13-2829-d428a2ab0692)

## 右键菜单样式
* 修改为旧版菜单样式
  ```pwsh
  reg add "HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32" /f /ve
  ```
* 恢复到新版默认样式
  ```pwsh
  reg delete "HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}" /f
  ```

参考来源：[Microsoft Learn: Restore old Right-click Context menu in Windows 11](https://learn.microsoft.com/en-us/answers/questions/2287432/(article)-restore-old-right-click-context-menu-in)

## 硬件时钟
* 要求硬件时钟使用 UTC 时间
  ```pwsh
  reg add "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\TimeZoneInformation" /v RealTimeIsUniversal /d 1 /t REG_DWORD /f
  ```
* 恢复硬件时钟默认的本地时间
  ```pwsh
  reg delete "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\TimeZoneInformation" /v RealTimeIsUniversal /f
  ```

参考来源：[ArchWiki: System time](https://wiki.archlinux.org/title/System_time#UTC_in_Microsoft_Windows)

## 文件资源管理器
文件资源管理器曾因一个 300 页的 PDF 文件无响应，排查后发现是 Windows Search 建立索引导致，禁用 Windows Search 后无法使用图库功能，因此隐藏侧栏图库图标
* 隐藏侧栏图库
  ```pwsh
  reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Desktop\NameSpace\{e88865ea-0e1c-4e20-9aa6-edcd0212c87c}" /f
  ```
* 恢复侧栏图库
  ```pwsh
  reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Desktop\NameSpace\{e88865ea-0e1c-4e20-9aa6-edcd0212c87c}" /f
  ```

文件资源管理器主文件夹加载有延迟，修改为默认打开“此电脑”后，隐藏侧栏主文件夹图标
* 隐藏侧栏主文件夹
  ```pwsh
  reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Desktop\NameSpace\{f874310e-b6b7-47dc-bc84-b9e6b38f5903}" /f
  ```
* 恢复侧栏主文件夹
  ```pwsh
  reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Desktop\NameSpace\{f874310e-b6b7-47dc-bc84-b9e6b38f5903}" /f
  ```

参考来源：[Super User: How to remove 'Home' and 'Gallery' from Windows 11 File Explorer](https://superuser.com/questions/1829494/how-to-remove-home-and-gallery-from-windows-11-file-explorer)
