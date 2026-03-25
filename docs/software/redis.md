# Redis

## 开发环境快速启动
2024年3月份 Redis 更换 License 之后，众多替代方案开始活跃，其中的开源 fork 多数基于 7.2.4 版本。  
考虑到生产环境主要接入云服务商来保证服务的可用性，因此选择 7.2 版本作为开发环境，保持尽量广泛的依赖兼容性。  
| Version         | Referred to as          | License                    |
| --------------- | ----------------------- | -------------------------- |
| 7.2 and earlier | Redis                   | BSD-3-Clause               |
| 7.4             | Redis Community Edition | RSALv2 or SSPLv1           |
| 8+              | Redis Open Source       | RSALv2 or SSPLv1 or AGPLv3 |
```sh
docker volume create redis-data
docker run -d --restart=always \
  --name redis-dev \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7.2-alpine \
  redis-server --save 60 1 --requirepass G6xhgNeRylHfFPMQ24qM

# 总是使用 named volume 避免 Dockerfile 中的 VOLUME 在缺少映射时自动创建 anonymous volume
# 连接示例 `redis-cli -u redis://default:G6xhgNeRylHfFPMQ24qM@127.0.0.1:6379/0`
```

参考来源：
* [Redis Legal hub: Licenses](https://redis.io/legal/licenses/)
* [Dockerfile of redis:7.2-alpine](https://github.com/redis/docker-library-redis/blob/master/7.2/alpine/Dockerfile)
* [Valkey Documentation: Migration from Redis to Valkey](https://valkey.io/topics/migration/)
