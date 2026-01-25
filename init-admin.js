// ========================================
// PulseOpti HR - 超级管理员初始化脚本
// ========================================

import { getDb, users, companies, departments, positions } from './src/storage/database/shared/schema.js';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function initSuperAdmin() {
  console.log('🚀 开始初始化超级管理员...\n');

  const db = await getDb();

  // 生成固定UUID
  const adminId = '550e8400-e29b-41d4-a716-446655440001';
  const companyId = '550e8400-e29b-41d4-a716-446655440002';
  const departmentId = '550e8400-e29b-41d4-a716-446655440003';
  const positionId = '550e8400-e29b-41d4-a716-446655440004';

  // 检查管理员是否已存在
  const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@aizhixuan.com.cn'));
  
  if (existingAdmin.length > 0) {
    console.log('⚠️  超级管理员已存在，跳过创建');
    console.log('📧 邮箱:', existingAdmin[0].email);
    console.log('👤 姓名:', existingAdmin[0].name);
    console.log('🔑 角色:', existingAdmin[0].role);
    console.log('👑 超级管理员:', existingAdmin[0].isSuperAdmin);
    process.exit(0);
  }

  // 创建默认公司
  console.log('📦 创建默认公司...');
  await db.insert(companies).values({
    id: companyId,
    name: 'PulseOpti HR 示例公司',
    industry: '互联网',
    size: '10-50人',
    establishedDate: new Date('2024-01-01'),
    address: '广州市天河区',
    website: 'https://www.aizhixuan.com.cn',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }).onConflictDoNothing();
  console.log('✅ 公司创建成功');

  // 创建默认部门
  console.log('📋 创建默认部门...');
  await db.insert(departments).values({
    id: departmentId,
    companyId,
    name: '总经办',
    code: 'GM',
    description: '总经理办公室',
    managerId: adminId,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }).onConflictDoNothing();
  console.log('✅ 部门创建成功');

  // 创建默认职位
  console.log('💼 创建默认职位...');
  await db.insert(positions).values({
    id: positionId,
    companyId,
    name: '总经理',
    code: 'GM001',
    level: 'L1',
    description: '公司总经理',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }).onConflictDoNothing();
  console.log('✅ 职位创建成功');

  // 创建超级管理员
  console.log('👑 创建超级管理员...');
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  await db.insert(users).values({
    id: adminId,
    name: '系统超级管理员',
    email: 'admin@aizhixuan.com.cn',
    password: hashedPassword,
    phone: '13800138000',
    role: 'admin',
    isSuperAdmin: true,
    companyId,
    departmentId,
    positionId,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log('✅ 超级管理员创建成功！\n');
  console.log('═══════════════════════════════════');
  console.log('📧 邮箱: admin@aizhixuan.com.cn');
  console.log('🔐 密码: Admin@123');
  console.log('👑 角色: admin (超级管理员)');
  console.log('═══════════════════════════════════\n');
  console.log('🎉 现在可以使用此账号登录系统了！');
  console.log('🌐 登录地址: http://localhost:3000\n');

  process.exit(0);
}

initSuperAdmin().catch(error => {
  console.error('❌ 初始化失败:', error);
  process.exit(1);
});
