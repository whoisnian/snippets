# SELinux
SELinux 是 Linux 的一项功能，用于实现强制访问控制。运行 SELinux 需要启用 SELinux 的内核、SELinux 用户空间工具，以及 SELinux 策略。

参考来源：
* [Rocky Linux guides: SELinux Security](https://docs.rockylinux.org/guides/security/learning_selinux/)
* [CentOS Wiki: SELinux](https://wiki.centos.org/HowTos(2f)SELinux.html)
* [ArchWiki: SELinux](https://wiki.archlinux.org/title/SELinux)

## 检查当前状态
执行 `getenforce` 可以获取当前操作模式：
* `Enforcing`: 大多情况下的默认模式，启用并强制执行已配置的安全策略，拒绝访问并记录操作
* `Permissive`: 宽松模式下，会检查已配置的安全策略发出警告和记录操作，但不会阻止访问
* `Disabled`: 禁用模式下，不再进行任何记录和阻止行为

执行 `sestatus` 可以获取更多信息：
```
SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   enforcing
Mode from config file:          enforcing
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)
Max kernel policy version:      31
```

## 修改操作模式
* `setenforce 1`: 临时修改为 enforcing 模式
* `setenforce 0`: 临时修改为 permissive 模式
* `sed -i /etc/selinux/config -e 's|^SELINUX=[a-zA-Z0-9]*|SELINUX=disabled|g' && reboot`: 持久化禁用

从 disabled 修改回 enforcing 模式时，需要对系统中的所有文件执行 relabel 操作，一种实现方式是 `touch /.autorelabel && reboot`

## 常见问题
CentOS 及 Rocky Linux 默认启用 SELinux，未调整模式的情况下可能遇到以下问题：
* 从二进制安装 Docker 后，启动 `dockerd` 服务及执行 `docker ps` 命令会超时
* Nginx 访问某位置上的 SSL 证书文件时提示 `permission denied`，在 journalctl 中可看到 SELinux 的拦截日志
* 手动创建的 `/usr/lib/systemd/system/*.service` 在执行 `systemctl status/start/enable` 时提示 `unit not found`
