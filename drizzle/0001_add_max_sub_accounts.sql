-- 添加 max_sub_accounts 列到 subscriptions 表
-- 该列用于表示每个订阅套餐支持的最大子账号数量

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS max_sub_accounts INTEGER NOT NULL DEFAULT 0;

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_subscriptions_max_sub_accounts
ON subscriptions(max_sub_accounts);

-- 为现有的订阅记录设置默认值
UPDATE subscriptions
SET max_sub_accounts = 0
WHERE max_sub_accounts IS NULL;
