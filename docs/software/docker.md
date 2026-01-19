# Docker

## 常用命令
* 查看磁盘占用详情 `docker system df -v`
* 清理未使用资源 `docker system prune -a`
* 清理无 TAG 的镜像 `docker image prune --force --filter "dangling=true"`
* 清理创建时间超过七天的镜像 `docker image prune -a --force --filter "until=168h"`
* 清理最近使用时间在七天前的构建缓存 `docker builder prune -a --force --filter "until=168h"`

## 常用工具
* layers 查看器 [dive](https://github.com/wagoodman/dive)，使用示例 `dive nginx:1.29.3-alpine`
* 镜像漏洞扫描工具 [trivy](https://github.com/aquasecurity/trivy)，使用示例 `trivy image --severity "HIGH,CRITICAL" --ignore-unfixed nginx:1.29.3-alpine`
* 镜像管理工具 [crane](https://github.com/google/go-containerregistry/tree/main/cmd/crane)，免 daemon 直接拉取镜像，尊重 HTTP(S)_PROXY 环境变量，同类工具对比：
  * Google 的 [crane](https://github.com/google/go-containerregistry/tree/main/cmd/crane): 功能简单，可作为 Go Package 自行扩展，提供 GitHub Releases
  * Red Hat 的 [skopeo](https://github.com/containers/skopeo): 功能相对复杂，底层接口分散在 github.com/containers/ 下其他仓库，发行版未提供时需自行编译，有动态库依赖
  * Microsoft 的 [oras](https://github.com/oras-project/oras): 提供 GitHub Releases，扩展性较低，[20250731](https://github.com/oras-project/oras/issues/1366) 才支持从 registry 拉取为 tar archive

## 迁移数据目录
```sh
sudo mkfs.ext4 /dev/vda1
sudo mkdir /data
sudo mount /dev/vda1 /data
sudo vim /etc/fstab # 添加自动挂载项，常用格式 UUID=XXXX /data ext4 defaults 0 2

sudo systemctl stop docker

sudo rsync -ah --info=progress2 /var/lib/docker/ /data/docker/ # 或者使用 cp -a
sudo mv /var/lib/docker /var/lib/docker.bak # 确认迁移完毕后再删除旧数据

sudo vim /etc/docker/daemon.json # 添加配置 "data-root":"/data/docker"
sudo systemctl start docker

sudo docker info | grep 'Docker Root Dir' # 确认新配置生效
sudo rm -rf /var/lib/docker.bak # 删除旧数据
```

注意事项：
* 使用 NFS 作为 Docker 数据目录会导致各种问题，官方不支持且不建议使用。
* 对于 XFS 文件系统需要开启 `d_type=true` 才能使用 overlay2 存储驱动，可以使用 `xfs_info` 命令确认 `ftype` 选项。降级到 VFS 存储驱动后可以运行 Docker，但由于不支持 copy-on-write，每个 layer 都是其前置 layer 的完整拷贝，占用大量磁盘空间且性能较差。

参考来源：
* [ArchWiki: fstab](https://wiki.archlinux.org/title/Fstab)
* [Docker Docs: OverlayFS storage driver](https://docs.docker.com/engine/storage/drivers/overlayfs-driver/)
* [Docker Docs: Troubleshooting](https://docs.docker.com/engine/security/rootless/troubleshoot/)

## 多架构镜像
* 除了使用 buildx 直接构建多架构镜像外，还可以手动维护 manifest 来创建多架构镜像
* manifest 通常由 registry 维护，所以 create/inspect 子命令都会请求 registry 拉取相关信息
* 本地 Docker 客户端拉取镜像时会自动处理 manifest，仅从 registry 拉取当前系统架构的镜像
```sh
docker push myapp:1.0.0-amd64 # 在 amd64 机器上构建并推送
docker push myapp:1.0.0-arm64 # 在 arm64 机器上构建并推送

# 在任意架构机器上创建并推送 manifest
docker manifest create myapp:1.0.0 myapp:1.0.0-amd64 myapp:1.0.0-arm64
docker manifest push myapp:1.0.0
docker manifest inspect myapp:1.0.0
```

参考来源：
* [Docker Docs: Multi-platform builds](https://docs.docker.com/build/building/multi-platform/)
* [Docker Docs: docker manifest](https://docs.docker.com/reference/cli/docker/manifest/)

## 镜像构建
参考示例：
* https://github.com/moby/moby/blob/master/Dockerfile
* https://github.com/docker-library/mysql/blob/master/8.0/Dockerfile.debian
* https://github.com/timescale/timescaledb-docker/blob/main/Dockerfile

相关文档：
* [Docker Docs: Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
* [Docker Docs: Building best practices](https://docs.docker.com/build/building/best-practices/)

## extra_hosts 分隔符
使用 Docker Compose 创建容器时收到报错 `Error response from daemon: invalid IP address in add-host: ""`，根据近期改动推测是未能正确从 `hostname=8.8.8.8` 中解析出 IP 地址。  
虽然 [Docker CLI reference](https://docs.docker.com/reference/cli/docker/container/run/#add-host) 和 [Docker Compose file reference](https://docs.docker.com/reference/compose-file/services/#extra_hosts) 中提到使用 `=` 或者 `:` 作为分隔符都可以，且更推荐使用 `=`。但由于官方文档缺少明确的版本划分，因此只能认为其对应的是最新版 Docker，旧版可能只支持一种分隔符。  

于是查找相关代码，关联的提交分别是 [docker/cli: a682b8e](https://github.com/docker/cli/commit/a682b8e655da8af6200c33f4d77ea60e11296716) 和 [compose-spec/compose-go: a5007e7](https://github.com/compose-spec/compose-go/commit/a5007e73822c1f143eb99efee35c0cadb35719ee)，最初是为了方便解析参数中带冒号的 ipv6 地址，而在 2023 年 11 月支持了使用 `=` 作为分隔符。  
因此如果 docker cli 版本小于 `v25.0.0` 或者 docker compose 版本小于 `v2.24.0`，那么使用 `=` 作为分隔符就可能出现这样的报错。
