# Rails Console

## 禁用 IRB 多行编辑以提升粘贴性能
```sh
bundle exec rails console -- --nomultiline
```

参考来源：[GitHub: rails issues#39909 Can 'rails console' pass '--nomultiline' to IRB?](https://github.com/rails/rails/issues/39909)

## 关闭或开启 SQL 日志输出
* 关闭 SQL 日志
  ```ruby
  ActiveRecord::Base.logger = nil
  ```
* 开启 SQL 日志
  ```ruby
  ActiveRecord::Base.logger = Logger.new(STDOUT)
  ```

参考来源：[GitHub: rails issues#5149 Logging ActiveRecord queries from Rails console?](https://github.com/rails/rails/issues/5149)

## 设置时间展示格式
* Rails 5.2 默认格式 `Mon, 08 Dec 2025 17:55:30 CST +08:00`  
  Rails 6.1/7.2 默认格式 `Mon, 08 Dec 2025 17:55:30.967256462 CST +08:00`  
  Rails 8.1 默认格式 `2025-12-08 17:55:30.967256462 CST +08:00`  
  设置为更易读的格式 `2025-12-08 17:55:30 +08:00`
  ```ruby
  class ActiveSupport::TimeWithZone
    def inspect
      "#{time.strftime('%F %T')} #{formatted_offset}"
    end
  end
  ```
* Rails 5.2/6.1/7.2/8.1 默认格式 `Mon, 08 Dec 2025`  
  设置为更易读的格式 `2025-12-08`
  ```ruby
  class Date
    def inspect
      strftime('%F')
    end
  end
  ```

参考来源：
* [Stack Overflow: Configure Rails console's default date time format](https://stackoverflow.com/questions/76728595/configure-rails-consoles-default-date-time-format)
* [Rails API documentation: ActiveSupport::TimeWithZone#inspect](https://api.rubyonrails.org/v8.1/classes/ActiveSupport/TimeWithZone.html#method-i-inspect)
* [Rails API documentation: Date#inspect](https://api.rubyonrails.org/v8.1/classes/Date.html#method-i-inspect)

## 名词复数化
```ruby showLineNumbers
'book'.pluralize    # books
'box'.pluralize     # boxes
'person'.pluralize  # people
'man'.pluralize     # men
'sheep'.pluralize   # sheep
'data'.pluralize    # data
```

参考来源：[Rails API documentation: String#pluralize](https://api.rubyonrails.org/v8.1/classes/String.html#method-i-pluralize)

## 多行字符串 (heredoc)
```ruby showLineNumbers
# 保留行首空白，结尾的 EOF 必须单独行且在行首
# "  first line\n  second line\n"
str = <<EOF
  first line
  second line
EOF

# 保留行首空白，结尾的 EOF 必须单独行，可以不在行首
# "  first line\n  second line\n"
str = <<-EOF
  first line
  second line
  EOF

# 忽略行首空白，结尾的 EOF 必须单独行，可以不在行首
# "first line\nsecond line\n"
str = <<~EOF
  first line
  second line
  EOF
```

参考来源：[Ruby-Doc 3.4.1: Literals](https://ruby-doc.org/3.4.1/syntax/literals_rdoc.html#label-Here+Document+Literals)

## 变量判空方法
|       | nil?  | if()  | empty?        | blank? | present? |
| ----- | ----- | ----- | ------------- | ------ | -------- |
| nil   | true  | false | NoMethodError | true   | false    |
| false | false | false | NoMethodError | true   | false    |
| true  | false | true  | NoMethodError | false  | true     |
| 0     | false | true  | NoMethodError | false  | true     |
| 1     | false | true  | NoMethodError | false  | true     |
| ""    | false | true  | true          | true   | false    |
| " "   | false | true  | false         | true   | false    |
| []    | false | true  | true          | true   | false    |
| [nil] | false | true  | false         | false  | true     |
| \{\}  | false | true  | true          | true   | false    |

:::tip
其中 `blank?` 和 `present?` 是 Rails 扩展的方法，且 `present? = !blank?`
:::

参考来源：
* [Stack Overflow: How to understand nil vs. empty vs. blank in Ruby](https://stackoverflow.com/questions/885414/how-to-understand-nil-vs-empty-vs-blank-in-ruby)
* [Rails API documentation: Object#present?](https://api.rubyonrails.org/v8.1/classes/Object.html#method-i-present-3F)

## 非预期的 delete_all 行为
通常调用 `delete_all` 方法时，期望是直接删除数据库中的记录，即对应到 SQL 语句的 DELETE 操作，例如：
```ruby
Post.where(user_id: 123).delete_all
# 期望执行的 SQL 语句: DELETE FROM posts WHERE user_id = 123;
```
但在某些情况下，`delete_all` 方法会表现出非预期的行为，对应的 SQL 语句是 UPDATE 而不是 DELETE，例如：
```ruby
User.find(123).posts.delete_all
# 期望执行的 SQL 语句: DELETE FROM posts WHERE user_id = 123;
# 实际执行的 SQL 语句: UPDATE posts SET user_id = NULL WHERE user_id = 123;
```

原因是两个例子中调用的 `delete_all` 方法是不同的：
* `Post.where(user_id: 123).class` 返回 `User::ActiveRecord_Relation`，调用的是 `ActiveRecord::Relation` 上的 `delete_all` 方法，官方文档中明确说明对应到单条 SQL DELETE 语句
* `User.find(123).posts.class` 返回 `Post::ActiveRecord_Associations_CollectionProxy`，调用的是 `ActiveRecord::Associations::CollectionProxy` 上的 `delete_all` 方法，官方文档中表示会根据关联的 `:dependent` 选项来决定删除策略

原始描述如下：
* __ActiveRecord::Relation#delete_all__
  > This is a single SQL DELETE statement that goes straight to the database, much more efficient than `destroy_all`.
* __ActiveRecord::Associations::CollectionProxy#delete_all__
  > Deletes all the records from the collection according to the strategy specified by the `:dependent` option. If no `:dependent` option is given, then it will follow the default strategy.  
  > For has_many associations, the default deletion strategy is `:nullify`. This sets the foreign keys to `NULL`.

参考来源：
* [Stack Overflow: ActiveRecord delete_all method updating instead of deleting](https://stackoverflow.com/questions/23879841/activerecord-delete-all-method-updating-instead-of-deleting)
* [Rails API documentation: ActiveRecord::Relation#delete_all](https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Relation.html#method-i-delete_all)
* [Rails API documentation: ActiveRecord::Associations::CollectionProxy#delete_all](https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Associations/CollectionProxy.html#method-i-delete_all)

## Rails 延迟加载 (lazy loading)
Rails 中的数据库查询通常是延迟加载 (lazy loading) 的，不会在定义时立即执行，而是在实际需要数据时才执行，例如：
```ruby showLineNumbers
ActiveRecord::Base.logger = Logger.new(STDOUT)

puts '========== breakpoint 1 =========='
users = User.where(active: true)
puts '========== breakpoint 2 =========='
names = users.pluck(:name)
puts '========== breakpoint 3 =========='
```
将以上代码保存为 lazy.rb，执行 `bundle exec rails runner lazy.rb` 运行该文件，输出结果如下：
```log showLineNumbers
========== breakpoint 1 ==========
========== breakpoint 2 ==========
D, [2025-12-16T00:25:20.297256 #17260] DEBUG -- :   User Pluck (0.1ms)  SELECT "users"."name" FROM "users" WHERE "users"."active" = TRUE /*application='Demo'*/
========== breakpoint 3 ==========
```
但在 Rails Console 中，默认会调用 inspect 方法来展示每一次输入的返回值，这会触发查询的执行，按行输入的效果为：
```ruby showLineNumbers
demo(dev):001> puts '========== breakpoint 1 =========='
# ========== breakpoint 1 ==========
# => nil

demo(dev):002> users = User.where(active: true)
#   User Load (0.1ms)  SELECT "users".* FROM "users" WHERE "users"."active" = TRUE /* loading for pp */ LIMIT 11 /*application='Demo'*/
# => 
# [#<User:0x00007fd39142d1e8
# ...

demo(dev):003> puts '========== breakpoint 2 =========='
# ========== breakpoint 2 ==========
# => nil

demo(dev):004> names = users.pluck(:name)
#   User Pluck (0.1ms)  SELECT "users"."name" FROM "users" WHERE "users"."active" = TRUE /*application='Demo'*/
# => ["admin1", "admin2", "admin3"]

demo(dev):005> puts '========== breakpoint 3 =========='
# ========== breakpoint 3 ==========
# => nil
```
为了避免在 Rails Console 中触发不必要的查询，可以通过一次粘贴多行，或者在单行结尾强制返回值为 nil 的方式，例如：
```ruby showLineNumbers
users = User.where(active: true); nil
names = users.pluck(:name)
#   User Pluck (0.1ms)  SELECT "users"."name" FROM "users" WHERE "users"."active" = TRUE /*application='Demo'*/
# => ["admin", "admin2", "admin3"]
```
同理，在 Rails Console 中调用 `each`、`map` 等迭代方法时，也会隐式调用 inspect 来展示结果，可以通过以下方式避免刷屏：
```ruby showLineNumbers
User.where(active: true).each do |u|
  puts u.name
end; nil # 在迭代结束后将返回值强制设为 nil，避免结果刷屏
```

参考来源：[Rails Tutorials: Lazy loading in rails](https://www.rubyinrails.com/2014/01/08/what-is-lazy-loading-in-rails/)
