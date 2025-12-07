# PowerShell

## 查看近期开关机事件
```powershell
Get-WinEvent -Oldest -FilterHashtable @{ LogName='System'; ProviderName='Microsoft-Windows-Kernel-General'; Id=12,13 }
```

## 端口转发及防火墙设置
* 添加端口转发规则
  ```powershell
  sudo netsh interface portproxy add v4tov4 listenport=12345 listenaddress=10.0.3.201 connectport=12345 connectaddress=10.42.1.2
  ```
* 删除端口转发规则
  ```powershell
  sudo netsh interface portproxy delete v4tov4 listenport=12345 listenaddress=10.0.3.201
  ```
* 查看所有端口转发规则
  ```powershell
  netsh interface portproxy show all
  ```
* 添加防火墙规则允许端口入站
  ```powershell
  sudo netsh advfirewall firewall add rule name="open_port_12345" dir=in action=allow protocol=TCP localport=12345
  ```
* 删除防火墙规则允许端口入站
  ```powershell
  sudo netsh advfirewall firewall delete rule name="open_port_12345"
  ```

参考来源：[Stack Overflow: port forwarding in windows](https://stackoverflow.com/questions/11525703/port-forwarding-in-windows)
