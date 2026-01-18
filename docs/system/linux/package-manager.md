# 包管理

参考来源：[ArchWiki: pacman/Rosetta](https://wiki.archlinux.org/title/Pacman/Rosetta)

## 安装软件
* `pacman -S PKG_NAME`
* `dnf install PKG_NAME`
* `apt install PKG_NAME`

## 更新软件
* `pacman -Syu`
* `dnf upgrade`
* `apt update && apt upgrade`

## 删除软件
* `pacman -Rs PKG_NAME`
* `dnf remove PKG_NAME`
* `apt autoremove PKG_NAME`

## 搜索软件
* `pacman -Ss KEYWORD`
* `dnf search KEYWORD`
* `apt search KEYWORD`

## 查询指定包信息
* `pacman -Si REMOTE_PKG_NAME` 或 `pacman -Qi LOCAL_PKG_NAME`
* `dnf info PKG_NAME`
* `apt show PKG_NAME`

## 查询正向依赖
* `pacman -Si REMOTE_PKG_NAME` 或 `pacman -Qi LOCAL_PKG_NAME`
* `dnf repoquery --requires PKG_NAME`
* `apt-cache depends PKG_NAME`

## 查询反向依赖
* `pacman -Sii REMOTE_PKG_NAME` 或 `pacman -Qii LOCAL_PKG_NAME`
* `dnf repoquery --alldeps --whatrequires PKG_NAME`
* `apt-cache rdepends PKG_NAME`

## 列出包含文件
* `pacman -Fl PKG_NAME`
* `dnf repoquery -l PKG_NAME`
* `apt-file list PKG_NAME`

## 查询文件归属
* `pacman -F FILENAME`
* `dnf provides FILENAME`
* `apt-file search FILENAME`
