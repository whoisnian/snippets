# Git

## 清理远端已删除的分支
```sh
git fetch -p && for branch in $(git for-each-ref --format '%(refname) %(upstream:track)' refs/heads | awk '$2 == "[gone]" {sub("refs/heads/", "", $1); print $1}'); do git branch -D $branch; done
```

参考来源：[Stack Overflow: Remove tracking branches no longer on remote](https://stackoverflow.com/questions/7726949/remove-tracking-branches-no-longer-on-remote)

## 利用 SSH 配置 Git 服务器
```sh
# verify git2 user not exist
id -u git2

# create git2 user without shell access
sudo useradd --create-home --home-dir /srv/git2 --shell /usr/bin/git-shell git2

# disable ubuntu ssh login banner
sudo -u git2 touch /srv/git2/.hushlogin

# add authorized_keys
sudo -u git2 mkdir -p /srv/git2/.ssh && sudo chmod 700 /srv/git2/.ssh
echo 'no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOFGA4//HlSP1bD2x1aMigIrW7qdWOATG7Ou7rzZgVC0 zhuchangbao1998@gmail.com' | sudo -u git2 tee /srv/git2/.ssh/authorized_keys
sudo chmod 600 /srv/git2/.ssh/authorized_keys

# create git repository
sudo -u git2 git init --bare /srv/git2/myproject.git
```
假设服务器访问域名为 example.com，则本地执行 `git clone git2@example.com:myproject.git` 即可拉取代码仓库

参考来源：[Pro Git: 4.4 Setting Up the Server](https://git-scm.com/book/en/v2/Git-on-the-Server-Setting-Up-the-Server)

## 从另一仓库拣选提交
```sh
# 将远端仓库或本地仓库添加为 remote
git remote add next git@github.com:whoisnian/snippets.git
git remote add next ~/Git/snippets

# 从 remote 查找 commit id 并拣选提交
git fetch next c6f4fe7ab6434fdc9ce16b833ae0e09804589b6a
git cherry-pick c6f4fe7ab6434fdc9ce16b833ae0e09804589b6a

# 清理 remote
git remote rm next
```

## 创建镜像仓库
```sh
git clone --mirror https://github.com/whoisnian/snippets.git

cd snippets
git remote set-url --push origin git@example.com:whoisnian/snippets.git

git fetch -p origin
git push --mirror
```

参考来源：[GitHub Docs: Duplicating a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/duplicating-a-repository)

## 拉取所有远端分支
```sh
for remote in $(git branch -r | grep -v -- '->'); do
  git branch --track "${remote#origin/}" "$remote"
done
git fetch --all
git pull --all
```

参考来源：[Stack Overflow: How do I fetch all Git branches?](https://stackoverflow.com/questions/10312521/how-do-i-fetch-all-git-branches)

## 应用代码补丁
```sh
# 常规 diff 生成补丁并应用
git diff > changes.patch
git apply changes.patch

# 推荐使用 format-patch 和 am 保留提交信息
git format-patch --stdout first_commit^..last_commit > changes.patch
git am -3 < changes.patch

# 仅从最后一次提交生成补丁
git format-patch --stdout HEAD^ > changes.patch
```

## 批量更新子目录下的仓库
```sh
for dir in */; do
  if [[ -d "$dir/.git" ]]; then
    current=$(git --git-dir="$dir/.git" --work-tree="$dir" rev-parse --abbrev-ref HEAD)
    echo "start $current at $dir"
    git --git-dir="$dir/.git" --work-tree="$dir" fetch --quiet
    git --git-dir="$dir/.git" --work-tree="$dir" merge --quiet --ff-only @{upstream}
  else
    echo "skip  $dir"
  fi
done
```

## 常用脚本变量
```sh
current_branch=$(git rev-parse --abbrev-ref HEAD)
default_branch=$(git rev-parse --abbrev-ref origin/HEAD)
test -z "$(git status --porcelain)";is_clean=$?
```
