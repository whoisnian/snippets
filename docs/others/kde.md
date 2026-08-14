# KDE 桌面环境

## 图标浏览器
KDE 在 `plasma-sdk` 包中提供了一个图标浏览器，用于浏览和搜索已安装的图标，旧版应用名为 `cuttlefish`，后续更名为 `iconexplorer`。

参考来源：[KDE Developer Documentation: Icons](https://develop.kde.org/docs/features/icons/#finding-the-right-icons)

## 文件管理器右键菜单
Dolphin 支持在 `~/.local/share/kio/servicemenus/` 下创建自定义的 `*.desktop` 文件，依据文件类型在右键菜单中添加不同的选项。例如对于图片文件添加“图像识别”选项，在子菜单中可选“识别为中文”“识别为英文”或“扫描二维码”，调用 `tesseract` 或 `zbarimg` 并在 `kdialog` 中展示结果。
```sh
[Desktop Entry]
Type=Service
MimeType=image/*;
Actions=scan-qrcode;ocr-eng;ocr-chi;
X-KDE-Submenu=图像识别

[Desktop Action ocr-chi]
Name=识别为中文
Icon=text-convert-to-regular
Exec=tesseract "%f" - -l chi_sim | kdialog --textbox - 640 512

[Desktop Action ocr-eng]
Name=识别为英文
Icon=text-convert-to-regular
Exec=tesseract "%f" - -l eng | kdialog --textbox - 640 512

[Desktop Action scan-qrcode]
Name=扫描二维码
Icon=view-barcode-qr
Exec=zbarimg --quiet "%f" | sed 's/^QR-Code://' | kdialog --textbox - 640 512
```

参考来源：[KDE Developer Documentation: Creating Dolphin service menus](https://develop.kde.org/docs/apps/dolphin/service-menus/)

## 远程桌面
KDE 提供了名为 KRDC 的远程桌面客户端，依赖 `libvncserver` 和 `freerdp` 提供 VNC 和 RDP 协议支持。  
但在 Arch Linux 上使用 RDP 协议连接局域网内的 Windows 主机时，遇到了初始化缓慢的问题，具体表现为点击信任证书后界面无响应，等待几分钟后才加载出 Windows 画面，后续操作正常无明显延迟。  

排查后发现是 freerdp 支持 kerberos 认证，而 Arch Linux 上的 kerberos 配置文件 `/etc/krb5.conf` 中默认包含 `kerberos.mit.edu` 外部地址，导致在连接 Windows 时本地会往 `kerberos.mit.edu:88` 发送 UDP 请求。正好赶上局域网内代理网关的上游节点对 UDP 代理支持不佳，导致 UDP 请求超时，最终影响了 RDP 连接的初始化速度。  

根据以上原因，一种解决方案是在局域网内的代理网关上禁用 UDP 代理，另一种则是直接禁用本地的 kerberos 认证。个人更推荐后者，因为本地确实没有地方用到 kerberos 认证，也不希望局域网内就能完成的功能还要去访问外部互联网。  
```sh
# 使用空的 krb5.conf 禁用 kerberos 认证
sudo mv /etc/krb5.conf /etc/krb5.conf.bak
sudo touch /etc/krb5.conf
```

参考来源：
* [ArchWiki: Kerberos](https://wiki.archlinux.org/title/Kerberos)
* [GitHub: FreeRDP issues#10138 Freerdp 3 authentication hangs due to broken krb5.conf](https://github.com/FreeRDP/FreeRDP/issues/10138)
* [FreeRDP FAQ: Connect takes a very long time (~1 minute)](https://github.com/freerdp/freerdp/wiki/FAQ#connect-takes-a-very-long-time-1-minute)

## NetworkManager 热点无法连接
* 创建无密码热点时，其他设备正常连接；
* 热点安全性修改为 `WPA3 个人版` 时，桌面端无法正常启用热点；
* 热点安全性修改为 `WPA2/WPA3 个人版` 时，桌面端正常启用，LineageOS 手机默认使用 WPA3 加密方式，无法正常连接；

问题丢给 Claude 后，先确认了本地网卡和驱动正常，又编写测试配置查看 journalctl 报错日志，定位到以下问题：
* 纯 WPA3 模式无法启用热点：NetworkManager 在 AP 模式下漏发 proto/pairwise/group
* WPA2/WPA3 混合模式：NetworkManager 广播了 SAE 但不开 MFP

对应的修复方案：
* 纯 WPA3 模式使用 nmcli 命令创建热点，并指定缺失参数，例如：
  ```sh
  nmcli con add type wifi ifname wlo1 con-name hotspot-wpa3 autoconnect no \
    ssid '热点名称' \
    802-11-wireless.mode ap 802-11-wireless.band bg 802-11-wireless.channel 6 \
    ipv4.method shared ipv6.method ignore \
    802-11-wireless-security.key-mgmt sae \
    802-11-wireless-security.psk '连接密码' \
    802-11-wireless-security.proto rsn \
    802-11-wireless-security.pairwise ccmp \
    802-11-wireless-security.group ccmp \
    802-11-wireless-security.pmf 3
  ```
  测试手动为已有的 `/etc/NetworkManager/system-connections/XXXXX.nmconnection` 补充配置项后重启 NetworkManager 也可生效：
  ```conf
  [wifi-security]
  key-mgmt=sae
  psk=mypassword
  # 手动添加以下四项 group/pairwise/pmf/proto
  group=ccmp;
  pairwise=ccmp;
  pmf=3
  proto=rsn;
  ```
* WPA2/WPA3 混合模式只能绕开 NetworkManager 使用 hostapd，关键配置为：
  ```conf
  wpa=2
  wpa_key_mgmt=WPA-PSK SAE
  ieee80211w=1
  sae_require_mfp=1
  ```

参考来源：
* [ArchWiki: Ad-hoc networking](https://wiki.archlinux.org/title/Ad-hoc_networking#wpa_supplicant)
* [Walt's Workbench: Securing a Wifi Hotspot with WPA3 using NetworkManager](https://waltsworkbench.com/securing-a-wifi-hotspot-with-wpa3-using-networkmanager-on-a-raspberry-pi-running-bookworm-aka-debian-12/)
