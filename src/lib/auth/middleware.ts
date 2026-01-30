import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken, type JWTPayload } from './jwt';
import { hasPermission, Permission, AuthUser } from './permissions';

/**
 * 从请求中获取用户信息
 */
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return null;
    }
    
    // 构建用户权限
    const user: AuthUser = {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: payload.role as any, // 类型转换，因为 payload.role 是 string，但 AuthUser.role 是 Role 枚举
      userType: payload.userType as any, // 类型转换，因为 payload.userType 是 string，但 AuthUser.userType 是 UserType 枚举
      isSuperAdmin: payload.isSuperAdmin || false,
      companyId: payload.companyId,
      parentUserId: payload.parentUserId,
      permissions: [], // TODO: 根据角色计算权限
      metadata: payload.metadata,
    };

    return user;
  } catch (error) {
    console.error('[Auth] 解析 token 失败:', error);
    return null;
  }
}

/**
 * 要求用户已认证
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | AuthUser> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: 用户未登录' }, { status: 401 });
  }

  return user;
}

/**
 * 要求用户具有指定权限（单个）
 */
export async function requirePermission(
  request: NextRequest,
  permission: Permission | string
): Promise<NextResponse | AuthUser> {
  return requireAnyPermission(request, [permission as Permission]);
}

/**
 * 要求用户具有指定权限
 */
export async function requireAnyPermission(
  request: NextRequest,
  permissions: Permission[]
): Promise<NextResponse | AuthUser> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: 用户未登录' }, { status: 401 });
  }

  const hasPerm = permissions.some(p => hasPermission(user, p));

  if (!hasPerm) {
    return NextResponse.json({ error: 'Forbidden: 权限不足' }, { status: 403 });
  }

  return user;
}

/**
 * 检查是否为超级管理员
 */
export function isSuperAdmin(user: AuthUser): boolean {
  return user.isSuperAdmin || user.role === 'super_admin';
}

/**
 * 要求超级管理员
 */
export async function requireSuperAdmin(request: NextRequest): Promise<NextResponse | AuthUser> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: 用户未登录' }, { status: 401 });
  }

  if (!isSuperAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden: 需要超级管理员权限' }, { status: 403 });
  }

  return user;
}
