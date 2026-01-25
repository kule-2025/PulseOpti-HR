-- 创建验证码表
-- 用于存储邮箱和短信验证码，支持无服务器环境（Vercel）

CREATE TABLE IF NOT EXISTS verification_codes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL,           -- 邮箱或手机号
    code VARCHAR(10) NOT NULL,                  -- 验证码
    purpose VARCHAR(20) NOT NULL,               -- 用途：login, register, reset
    type VARCHAR(20) NOT NULL,                  -- 类型：email, sms
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 过期时间
    used_at TIMESTAMP WITH TIME ZONE,           -- 使用时间（NULL表示未使用）
    ip_address VARCHAR(50),                     -- IP地址
    metadata JSONB,                             -- 其他元数据
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_verification_codes_identifier_purpose 
    ON verification_codes(identifier, purpose);

CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at 
    ON verification_codes(expires_at);

-- 添加注释
COMMENT ON TABLE verification_codes IS '验证码表，用于存储邮箱和短信验证码';
COMMENT ON COLUMN verification_codes.identifier IS '标识符（邮箱或手机号）';
COMMENT ON COLUMN verification_codes.code IS '验证码';
COMMENT ON COLUMN verification_codes.purpose IS '用途：login（登录）、register（注册）、reset（重置密码）';
COMMENT ON COLUMN verification_codes.type IS '类型：email（邮箱）、sms（短信）';
COMMENT ON COLUMN verification_codes.expires_at IS '过期时间（5分钟后过期）';
COMMENT ON COLUMN verification_codes.used_at IS '使用时间（NULL表示未使用）';
COMMENT ON COLUMN verification_codes.ip_address IS '请求IP地址';

-- 创建清理过期验证码的函数（可选，用于定时清理）
CREATE OR REPLACE FUNCTION clean_expired_verification_codes()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM verification_codes
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION clean_expired_verification_codes() IS '清理过期的验证码，返回删除的记录数';
