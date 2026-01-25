import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyToken, type JWTPayload } from './jwt';
import { hasPermission, unauthorized, permissionDenied } from './permissions';

/**
 * 从请求中获取用户信息
 */
export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * 要求用户已认证
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | JWTPayload> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return unauthorized();
  }

  return user;
}

/**
 * 要求用户具有指定权限
 */
export async function requirePermission(
  request: NextRequest,
  permissionCode: string
): Promise<NextResponse | JWTPayload> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return unauthorized();
  }

  const hasPerm = await hasPermission(user, permissionCode);

  if (!hasPerm) {
    return permissionDenied();
  }

  return user;
}

/**
 * 要求用户具有任意一个权限
 */
export async function requireAnyPermission(
  request: NextRequest,
  permissionCodes: string[]
): Promise<NextResponse | JWTPayload> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return unauthorized();
  }

  const hasPerm = await Promise.any(
    permissionCodes.map(code => hasPermission(user, code))
  );

  if (!hasPerm) {
    return permissionDenied();
  }

  return user;
}

/**
 * 要求用户具有所有权限
 */
export async function requireAllPermissions(
  request: NextRequest,
  permissionCodes: string[]
): Promise<NextResponse | JWTPayload> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return unauthorized();
  }

  const hasPerm = await Promise.all(
    permissionCodes.map(code => hasPermission(user, code))
  ).then(results => results.every(r => r));

  if (!hasPerm) {
    return permissionDenied();
  }

  return user;
}

/**
 * 检查是否为超级管理员
 */
export function isSuperAdmin(user: JWTPayload): boolean {
  return user.isSuperAdmin || user.role === 'super_admin';
}

/**
 * 要求超级管理员
 */
export async function requireSuperAdmin(request: NextRequest): Promise<NextResponse | JWTPayload> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return unauthorized();
  }

  if (!isSuperAdmin(user)) {
    return permissionDenied();
  }

  return user;
}
