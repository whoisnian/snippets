# MySQL

## 开发环境快速启动
MySQL 5.X 的默认身份验证插件是 `mysql_native_password`，从 MySQL 8.0.34 起被标记为弃用，在 MySQL 8.4 中默认禁用，在 MySQL 9.X 中移除。  
MySQL 8.0 及之后的版本将默认插件更换为 `caching_sha2_password`，但部分语言驱动适配滞后，一些情况下仍需降级为 `mysql_native_password` 保持最大兼容性。  
```sh
docker volume create mysql-data
docker run --name mysql-dev \
  -e MYSQL_ROOT_PASSWORD=V9lwqSsvRseYcgWzRlDI \
  -v mysql-data:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci \
  --default-authentication-plugin=mysql_native_password
```

参考来源：
* [MySQL 8.4 Manual: 8.4.1.1 Native Pluggable Authentication](https://dev.mysql.com/doc/refman/8.4/en/native-pluggable-authentication.html)
* [GitHub: node.js: mysqljs/mysql/issues/1959](https://github.com/mysqljs/mysql/issues/1959)
* [GitHub: ruby: brianmario/mysql2/issues/1015](https://github.com/brianmario/mysql2/issues/1015)

## 创建用户并授权数据库
```sql
CREATE USER 'nian'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
SELECT user, host, plugin FROM mysql.user;
GRANT ALL ON demodb.* TO 'nian'@'%'; -- then nian can create/drop database demodb
```

## 启动时自动设置空密码
```sh
sudo vim /etc/mysql/conf.d/mysql_empty_password.cnf
# [mysqld]
# init_file=/etc/mysql/conf.d/mysql_empty_password.sql

sudo vim /etc/mysql/conf.d/mysql_empty_password.sql 
# ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
```

参考来源：[Blog: 在Ubuntu上为MySQL的root用户设置空密码](https://whoisnian.com/2020/11/23/在Ubuntu上为MySQL的root用户设置空密码/#解决办法)

## 跳过权限验证重置密码
编辑 `/etc/mysql/mysql.conf.d/mysqld.cnf` 添加启动参数 (MySQL 8.0 in Ubuntu 18)
```conf
[mysqld]
skip-grant-tables
```
执行 `mysql -u root` 登录数据库后重置密码
```sql
FLUSH PRIVILEGES; -- important
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
```

参考来源：[MySQL 8.0 Manual: B.3.3.2 How to Reset the Root Password](https://dev.mysql.com/doc/refman/8.0/en/resetting-permissions.html)

## 调整最大索引长度
创建索引时报错 `Specified key was too long; max key length is 767 bytes: CREATE INDEX xxxxxx on xxxxxx`
```sql
-- 临时调整服务端配置
SHOW VARIABLES LIKE 'innodb_large_prefix';
SET GLOBAL innodb_large_prefix=ON;
SHOW VARIABLES LIKE 'innodb_large_prefix';
```

参考来源：[阿里云官方文档: RDS MySQL创建索引时提示“Specified key was too long; max key length is 767 bytes”](https://help.aliyun.com/zh/rds/support/specified-key-was-too-long-max-key-length-is-767-bytes)

## 调整最大数据包大小
执行 SQL 时报错 `Packet for query is too large`
```sql
-- 临时调整服务端配置
SHOW VARIABLES LIKE 'max_allowed_packet';
SET GLOBAL max_allowed_packet=67108864;
-- default 4MiB in MySQL 5.7
-- default 64MiB in MySQL 8.0
-- default 16MiB in mysql client
```

参考来源：
* [MySQL 8.0 Manual: B.3.2.8 Packet Too Large](https://dev.mysql.com/doc/refman/8.0/en/packet-too-large.html)
* [MySQL 8.0 Manual: 7.1.8 Server System Variables](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_max_allowed_packet)
* [MySQL 5.7 Manual: 5.1.7 Server System Variables](https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_max_allowed_packet)

## 获取下一个自增值
```sql
SHOW TABLE STATUS FROM demodb where name='users';
SELECT AUTO_INCREMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='demodb' AND TABLE_NAME='users';
```

参考来源：[Stack Overflow: Get current AUTO_INCREMENT value for any table](https://stackoverflow.com/questions/15821532/get-current-auto-increment-value-for-any-table)

## 获取服务端版本号
```sql
SHOW VARIABLES LIKE 'version%';
```

参考来源：[MySQL 8.0 Manual: 7.1.8 Server System Variables](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_version)

## 修改字符编码
```sql
-- 按数据库查询所有表
SELECT T.TABLE_NAME, CCSA.CHARACTER_SET_NAME, CCSA.COLLATION_NAME
FROM information_schema.TABLES AS T
  JOIN information_schema.COLLATION_CHARACTER_SET_APPLICABILITY AS CCSA
  ON (T.TABLE_COLLATION = CCSA.COLLATION_NAME)
WHERE TABLE_SCHEMA='demodb';
-- 修改指定表的字符编码
ALTER TABLE `users` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 为数据库下所有表生成修改语句
SELECT CONCAT("ALTER TABLE ", TABLE_SCHEMA, '.', TABLE_NAME, " CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;") AS cmds
FROM information_schema.TABLES
WHERE TABLE_TYPE='BASE TABLE' AND TABLE_SCHEMA='demodb';
```

参考来源：
* [Atlassian Support: Fix the Collation and Character Set of a MySQL Database for Data Center](https://confluence.atlassian.com/kb/fix-the-collation-and-character-set-of-a-mysql-database-for-data-center-744326173.html)
* [Stack Overflow: MySQL: Get character-set of database or table or column?](https://stackoverflow.com/questions/1049728/mysql-get-character-set-of-database-or-table-or-column)
* [Stack Overflow: MySQL: How to convert all tables in database to one collation?](https://stackoverflow.com/questions/10859966/how-to-convert-all-tables-in-database-to-one-collation)

## 获取活跃连接详情
```sql
SHOW STATUS LIKE 'Threads%';
SHOW PROCESSLIST;
SELECT * FROM information_schema.processlist WHERE info IS NOT NULL;
-- 按 ipv4 来源地址统计连接数
SELECT SUBSTRING_INDEX(host, ':', 1) AS client_ip, COUNT(*) AS client_num FROM information_schema.processlist GROUP BY client_ip ORDER BY client_num DESC;
-- 按查询语句统计连接数
SELECT info, COUNT(*) AS client_num FROM information_schema.processlist WHERE info IS NOT NULL GROUP BY info ORDER BY client_num DESC;
-- 按 id 清理单条连接
KILL 12345;
-- 按查询语句生成 kill 命令
SELECT GROUP_CONCAT(CONCAT('KILL ', id, ';') SEPARATOR ' ') AS cmds FROM information_schema.processlist WHERE info='SELECT COUNT(*) FROM `users`';
-- 按来源地址生成 kill 命令
SELECT GROUP_CONCAT(CONCAT('KILL ', id, ';') SEPARATOR ' ') AS cmds FROM information_schema.processlist WHERE host LIKE '172.17.0.1:%';
-- group_concat_max_len 默认值 1024，生成语句过长时需要调整该参数
SET group_concat_max_len = 2048;
```

参考来源：
* [MySQL 8.0 Manual: 7.1.10 Server Status Variables](https://dev.mysql.com/doc/refman/8.0/en/server-status-variables.html)
* [MySQL 8.0 Manual: 10.14.1 Accessing the Process List](https://dev.mysql.com/doc/refman/8.0/en/processlist-access.html)
* [Stack Overflow: How to find MySQL process list and to kill those processes?](https://stackoverflow.com/questions/44192418/how-to-find-mysql-process-list-and-to-kill-those-processes)

## 存储空间优化
* MySQL 表数据量较大时，DELETE 语句并不会直接释放磁盘空间，仅会将部分空间标记为可重用
* 对于 InnoDB 引擎，`OPTIMIZE TABLE` 实际执行的是 `ALTER TABLE ... FORCE`, 因此会提示 `Table does not support optimize, doing recreate + analyze instead`
* 虽然 `OPTIMIZE TABLE` 对于 InnoDB 引擎使用 [Online DDL](https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl.html) 的方式执行，支持并发 DML 操作，但考虑到对于 IO 资源的抢占仍应在低负载时执行
```sql
-- 按数据及索引总大小排序
SELECT
  table_name,
  round(((data_length + index_length) / 1024 / 1024), 2) as size_mb
FROM information_schema.tables
WHERE table_schema='demodb'
ORDER BY size_mb DESC;
-- 按空闲空间大小排序
SELECT
  table_name,
  round((data_length / 1024 / 1024), 2) as data_length_mb,
  round((index_length / 1024 / 1024), 2) as index_length_mb,
  round((data_free / 1024 / 1024), 2) as data_free_mb
FROM information_schema.tables
WHERE table_schema='demodb'
ORDER BY data_free_mb DESC;
-- 计算数据/索引/空闲空间总大小
SELECT
  round(sum(data_length) / 1024 / 1024, 2) as data_length_mb,
  round(sum(index_length) / 1024 / 1024, 2) as index_length_mb,
  round(sum(data_free) / 1024 / 1024, 2) as data_free_mb
FROM information_schema.tables
WHERE table_schema='demodb';
-- 优化存储空间
OPTIMIZE TABLE projects;
```

参考来源：
* [MySQL 8.0 Manual: 15.7.3.4 OPTIMIZE TABLE Statement](https://dev.mysql.com/doc/refman/8.0/en/optimize-table.html)
* [AWS re:Post: Why does my Amazon RDS for MySQL DB instance use more storage than I expect?](https://repost.aws/knowledge-center/rds-mysql-storage-optimization)
* [阿里云官方文档: 使用OPTIMIZE TABLE命令释放MySQL实例的表空间](https://help.aliyun.com/zh/rds/support/how-do-i-use-the-optimize-table-statement-to-release-the-tablespace-of-an-apsaradb-rds-for-mysql-instance)

## 新增字段预估耗时
向已存在的表新增字段时，通常指定 `ALGORITHM=INPLACE, LOCK=NONE` 来支持并发 DML 操作，例如：
```sql
ALTER TABLE `users` ADD `short_name` varchar(255), ALGORITHM=INPLACE, LOCK=NONE;
```
> `ALGORITHM=INPLACE`: Operations avoid copying table data but may rebuild the table in place. An exclusive metadata lock on the table may be taken briefly during preparation and execution phases of the operation. Typically, concurrent DML is supported.  
>
> `LOCK=NONE`: If supported, permit concurrent reads and writes. Otherwise, an error occurs.  

新增字段时 `ALGORITHM=INPLACE` 总是会导致重建表，因此在 IO 性能不变的情况下，新增字段的耗时主要与表的存储大小正相关，可以根据历史记录及当前表大小预估新增字段耗时，查询表大小：
```sql
SELECT
  table_name,
  round(((data_length + index_length) / 1024 / 1024), 2) as size_mb
FROM information_schema.tables
WHERE table_schema='demodb';
```
生产环境部分表新增字段历史记录：
| time           | W IOPS max | size before | size after  | duration       |
| -------------- | ---------- | ----------- | ----------- | -------------- |
| 20220316 20:00 | 817        | 590.50 MB   | 465.54 MB   | 2m44s (164s)   |
| 20220316 20:15 | 793        | unknown     | 659.75 MB   | 3m53s (233s)   |
| 20220407 19:10 | 794        | 529.55 MB   | 602.55 MB   | 3m35s (215s)   |
| 20220422 19:00 | 870        | 465.55 MB   | 504.58 MB   | 2m53s (173s)   |
| 20220423 23:50 | 790        | 1981.80 MB  | 1744.73 MB  | 9m26s (566s)   |
| 20220423 23:50 | 97         | 68.64 MB    | 73.64 MB    | 24s            |
| 20220423 23:50 | 465        | 125.30 MB   | 131.30 MB   | 43s            |
| 20220423 23:50 | 338        | 120.69 MB   | 115.75 MB   | 36s            |
| 20220423 23:50 | 126        | 13.55 MB    | 12.55 MB    | 4s             |
| 20220623 18:17 | 881        | 1613.34 MB  | 1735.20 MB  | 9m52s (592s)   |
| 20220629 20:17 | 825        | 1340.61 MB  | 1060.78 MB  | 6m30s (390s)   |
| 20220712 18:26 | 870        | 1735.20 MB  | 1884.22 MB  | 10m45s (645s)  |
| 20230105 17:50 | 1119       | 8201.28 MB  | 6540.72 MB  | 31m53s (1913s) |
| 20230328 20:15 | 618        | 208.81 MB   | 213.83 MB   | 1m12s (72s)    |
| 20230328 20:15 | 828        | 2135.91 MB  | 2245.98 MB  | 12m38s (758s)  |
| 20231101 19:20 | 1180       | 12142.42 MB | 8697.86 MB  | 30m48s (1848s) |
| 20240528 19:05 | 1398       | 1258.56 MB  | 1258.56 MB  | 99s            |
| 20240528 21:10 | 2119       | 3187.16 MB  | 3187.16 MB  | 4m56s(296s)    |
| 20240822 19:40 | 1753       | 1904.25 MB  | 1904.25 MB  | 2m50s(170s)    |
| 20241125 20:50 | 6200       | 7487.00 MB  | 7487.00 MB  | 4m4s(244s)     |
| 20241125 21:10 | 7313       | 12359.69 MB | 12359.69 MB | 5m57s(357s)    |
| 20250417 20:00 | 7236       | 12195.47 MB | 12195.47 MB | 5m59s(359s)    |
| 20251013 19:20 | 7021       | 1744.77 MB  | 1744.77 MB  | 48s            |
| 20251013 19:20 | 8245       | 2575.95 MB  | 2575.95 MB  | 60s            |

其中 2024 年 10 月 从 AWS 迁移至阿里云，磁盘 IO 性能大幅提升。

参考来源：
* [MySQL 8.0 Manual: 15.1.9 ALTER TABLE Statement](https://dev.mysql.com/doc/refman/8.0/en/alter-table.html#alter-table-performance)
* [MySQL 8.0 Manual: 17.12.1 Online DDL Operations](https://dev.mysql.com/doc/refman/8.0/en/innodb-online-ddl-operations.html#online-ddl-column-operations)

## 使用 Wireshark 观察 MySQL 响应
### 查询单条记录
1. 原始输入: `ProjectMeta.last.id`
2. 对应语句: ``SELECT `project_meta`.* FROM `project_meta` ORDER BY `project_meta`.`id` DESC LIMIT 1``
3. 响应内容（12 packets）:
   ```
   1. fields cnt: 8
   2. def of id
   3. def of cid
   4. def of mtime
   5. def of name
   6. def of type
   7. def of ttag
   8. def of upper_cid
   9. def of upper_type
   10. EOF(0xfe)
   11. text: 45 fcglsycn8l0a5zr08 1708674441 NULL proto2 P=v3 fcglsycn8ky6sf066 flat-combo-group
   12. EOF(0xfe)
   ```
### 新增单条记录
1. 原始输入: `ProjectMeta.create!(cid: 'abc', upper_cid: 'def', upper_type: 'project-basic')`
2. 对应语句: `BEGIN`
3. 响应内容（1 packet）: `OK`
4. 对应语句: ``SELECT 1 AS one FROM `project_meta` WHERE `project_meta`.`cid` = BINARY 'abc' LIMIT 1``
5. 响应内容（4 packets）:
   ```
   1. fields cnt: 1
   2. def of one
   3. EOF(0xfe)
   4. EOF(0xfe)
   ```
6. 对应语句: ``INSERT INTO `project_meta` (`cid`, `upper_cid`, `upper_type`) VALUES ('abc', 'def', 'project-basic')``
7. 响应内容（1 packet）: `OK (Last INSERT ID: 48)`
8. 对应语句: `COMMIT`
9. 响应内容（1 packet）: `OK`
### 查询多条记录
1. 原始输入: `ProjectMeta.where('id >= ?', 45)`
2. 对应语句: ``SELECT `project_meta`.* FROM `project_meta` WHERE (id >= 45)``
3. 响应内容（13 packets）:
   ```
   1. fields cnt: 8
   2. def of id
   3. def of cid
   4. def of mtime
   5. def of name
   6. def of type
   7. def of ttag
   8. def of upper_cid
   9. def of upper_type
   10. EOF(0xfe)
   11. text: 45 fcglsycn8l0a5zr08 1708674441 NULL proto2 P=v3 fcglsycn8ky6sf066 flat-combo-group
   12. text: 48 abc NULL NULL prototype NULL def project-basic
   13. EOF(0xfe)
   ```
