# 编译

## 交叉编译
* 查看所有 GOOS 和 GOARCH 组合方式：`go tool dist list`，常用的组合方式有：
  ```sh showLineNumbers
  CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build .
  CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build .
  CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build .
  CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build .
  CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build .
  ```
* 如果仅需复制编译结果到基础镜像，对基础镜像无额外操作，可以利用交叉编译方便地在同一台机器上构建出多架构镜像：
  ```sh showLineNumbers
  # syntax=docker/dockerfile:1.20
  FROM --platform=$BUILDPLATFORM golang:1.25.5-alpine3.23 AS build
  ARG TARGETOS
  ARG TARGETARCH
  WORKDIR /app
  COPY . .
  RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o server .

  FROM alpine:3.23
  COPY --from=build /app/server /server
  ENTRYPOINT ["/server"]
  ```
  执行 `docker build --platform linux/amd64,linux/arm64 -t go-server:0.0.1 .` 即可构建镜像。

:::warning
对于旧版本 Docker (< 29.0)，执行命令构建多架构镜像时可能报错：  
> ERROR: failed to build: Multi-platform build is not supported for the docker driver.  
> Switch to a different driver, or turn on the containerd image store, and try again.  
> Learn more at https://docs.docker.com/go/build-multi-platform/  

需要开启 containerd image store 或者使用 custom builder 来解决。
:::

参考来源：
* [Docker Docs: Cross-compiling a Go application](https://docs.docker.com/build/building/multi-platform/#cross-compiling-a-go-application)
* [Docker Docs: containerd image store with Docker Engine](https://docs.docker.com/engine/storage/containerd/)

## 静态链接
* 当禁用 cgo 时，默认就是静态链接，无需额外参数
  ```sh
  CGO_ENABLED=0 go build .
  ```
* 当启用 cgo 时，需要补充 ldflags 指明使用静态链接
  ```sh
  CGO_ENABLED=1 go build -ldflags "-linkmode external -extldflags -static"
  ```

参考来源：[Blog: 在 chroot jail 中运行Golang程序](https://whoisnian.com/2023/10/17/在-chroot-jail-中运行Golang程序/#动态链接)

## 减小产物体积
```sh
go build -trimpath -ldflags="-s -w" .
# go help build:
#   -trimpath: remove all file system paths from the resulting executable
# go tool link:
#   -s: disable symbol table
#   -w: disable DWARF generation
```
