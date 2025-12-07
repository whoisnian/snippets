# SSH

## 生成 SSH 密钥对
```sh
ssh-keygen -t ed25519 -C "your_email@example.com"

# 如果使用的是不支持 Ed25519 算法的旧系统，则可换用 RSA 算法
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

参考来源：[GitHub Docs: Generating a new SSH key and adding it to the ssh-agent](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)

## 从私钥导出公钥
```sh
ssh-keygen -y -f ~/.ssh/id_ed25519
```

## 移除已知主机密钥
部分操作系统如 Debian 启用了 [ssh_config](https://manpages.debian.org/bullseye/openssh-client/ssh_config.5.en.html) 中的 `HashKnownHosts` 选项，因此无法手动编辑 `~/.ssh/known_hosts`，需要使用 `ssh-keygen -R` 命令移除已知主机密钥：
```sh
ssh-keygen -R hostname
ssh-keygen -R "[hostname]:port"
```

## 端口转发
A 公网主机，有独立 IP  
B 本地主机，位于 NAT 后，无法被外网访问  

* 访问本地端口的请求，转发到远程主机端口  
  B: `ssh -L PORT_B:HOST_A:PORT_A USER_A@HOST_A`
* 访问远程主机端口的请求，转发到本地端口  
  B: `ssh -R PORT_A:HOST_B:PORT_B USER_A@HOST_A`

其它参数：
* `-f` 后台运行
* `-i` 指定要用的私钥
* `-C` 允许压缩
* `-N` 只端口转发，不执行命令

注意事项：
* 需要在远程主机中允许端口转发，即在 sshd_config 中配置 `AllowTcpForwarding yes`  
* 如果需要 `ssh -R` 监听的远程端口对外部开放，则需要在远程主机中配置 `GatewayPorts yes`，否则默认仅监听回环地址  
* 如果需要 `ssh -L` 监听本地 1024 以下的端口，可以通过 `setcap` 赋予 `ssh` 可执行文件相应权限  
  `sudo setcap 'cap_net_bind_service=+ep' /usr/bin/ssh`

## 内网穿透
A 公网主机，有独立 IP，允许主机 A/B 访问，已配置 `GatewayPorts yes`  
B 本地主机，位于 NAT 后，无法被外网访问，后台运行 autossh  
C 另一主机，位于 NAT 后，无法被外网访问，普通 SSH 客户端

* 在主机 A 上允许主机 B 通过公钥认证登录，禁止执行任何命令，仅允许转发指定端口：
  ```sh title="~/.ssh/authorized_keys"
  restrict,port-forwarding,permitlisten="8022",command="/bin/false" ssh-ed25519 AAAAC3NzaC...
  ```
* 在主机 B 上安装 autossh 并创建 systemd 服务：
  ```systemd title="/etc/systemd/system/autossh.service"
  [Unit]
  Description=AutoSSH service for port 22
  After=network.target

  [Service]
  Environment="AUTOSSH_GATETIME=0"
  ExecStart=/usr/bin/autossh -M 0 -o ControlMaster=no -o ServerAliveCountMax=3 -o ServerAliveInterval=20 -o ExitOnForwardFailure=yes -NR :8022:127.0.0.1:22 USER_A@HOST_A
  Restart=always

  [Install]
  WantedBy=multi-user.target
  ```
* 在主机 C 上即可通过主机 A 的转发端口访问到主机 B：
  ```sh
  ssh USER_B@HOST_A -p 8022
  ```

参考来源：[ArchWiki: OpenSSH](https://wiki.archlinux.org/title/OpenSSH#Autossh_-_automatically_restarts_SSH_sessions_and_tunnels)

## GitHub SSH 协议配置 SOCKS5 代理
```sh
Match originalhost github.com exec "timeout 0.01 nc -z 127.0.0.1 1089 2> /dev/null"
    ProxyCommand nc -F -X 5 -x 127.0.0.1:1089 %h %p
    ProxyUseFdpass yes

Host github.com
    Hostname ssh.github.com
    Port 443
    User git
    IdentityFile ~/.ssh/id_ed25519
```
配置中的 `nc` 命令常见实现有 OpenBSD 和 GNU 两种，参数及行为并不完全相同，以上配置适用于更常见的 openbsd-netcat

## 限制 SSH 公钥执行特定命令
```sh title="~/.ssh/authorized_keys"
no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty,command="[[ $SSH_ORIGINAL_COMMAND =~ ^/opt/ssh_exec/.* ]] && bash -c $SSH_ORIGINAL_COMMAND" ssh-ed25519 AAAAC3NzaC...
```

## 共享本地网络给远程服务器
本地使用 `ssh -D` 创建 SOCKS5 代理，共享给远端服务器：
```sh
ssh -D 8118 localhost
ssh -R 8118:127.0.0.1:8118 user@remote_host

export http_proxy=socks5://127.0.0.1:8118
export https_proxy=socks5://127.0.0.1:8118
```
