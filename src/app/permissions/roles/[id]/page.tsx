"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Shield, 
  Users,
  Check,
  X,
  Settings
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  code: string;
  description: string | null;
  level: number;
  isSystem: boolean;
  isActive: boolean;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
  resource: string | null;
  action: string;
  isSystem: boolean;
  isActive: boolean;
  assigned: boolean;
}

interface User {
  id: string;
  name: string;
  username: string | null;
  email: string;
  role: string;
}

export default function RoleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    code: "",
    description: "",
    level: 0,
    isActive: false,
  });
  const [assigningPermission, setAssigningPermission] = useState<string[]>([]);

  useEffect(() => {
    fetchRoleDetail();
  }, [params.id]);

  const fetchRoleDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/permissions/roles/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRole(data.data);
        setPermissions(data.data.permissions || []);
        setUsers(data.data.users || []);
        setEditData({
          name: data.data.name,
          code: data.data.code,
          description: data.data.description || "",
          level: data.data.level,
          isActive: data.data.isActive,
        });
      }
    } catch (error) {
      console.error("Failed to fetch role detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/permissions/roles/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchRoleDetail();
      }
    } catch (error) {
      console.error("Failed to save role:", error);
    }
  };

  const handleAssignPermissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/permissions/roles/${params.id}/permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissionIds: assigningPermission }),
      });

      if (response.ok) {
        setAssigningPermission([]);
        fetchRoleDetail();
      }
    } catch (error) {
      console.error("Failed to assign permissions:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-slate-500">角色不存在</div>
      </div>
    );
  }

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/permissions/roles">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                  {role.name}
                </h1>
                {role.isSystem && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    系统预置
                  </Badge>
                )}
                <Badge variant={role.isActive ? "default" : "secondary"}>
                  {role.isActive ? "激活" : "禁用"}
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {role.code} · Level {role.level}
              </p>
            </div>
          </div>
          {!role.isSystem && (
            <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "取消编辑" : "编辑角色"}
            </Button>
          )}
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          {/* 基本信息 */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>角色基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">角色名称</Label>
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">角色代码</Label>
                      <Input
                        id="code"
                        value={editData.code}
                        onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">描述</Label>
                      <Textarea
                        id="description"
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">角色级别</Label>
                      <Input
                        id="level"
                        type="number"
                        min="0"
                        max="10"
                        value={editData.level}
                        onChange={(e) => setEditData({ ...editData, level: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={editData.isActive}
                        onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                      />
                      <Label htmlFor="isActive">启用角色</Label>
                    </div>
                    <Button onClick={handleSaveRole} className="mt-4">
                      <Save className="h-4 w-4 mr-2" />
                      保存修改
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-500">角色代码</Label>
                        <p className="font-medium">{role.code}</p>
                      </div>
                      <div>
                        <Label className="text-slate-500">角色级别</Label>
                        <p className="font-medium">Level {role.level}</p>
                      </div>
                      <div>
                        <Label className="text-slate-500">状态</Label>
                        <p className="font-medium">{role.isActive ? "激活" : "禁用"}</p>
                      </div>
                      <div>
                        <Label className="text-slate-500">类型</Label>
                        <p className="font-medium">{role.isSystem ? "系统预置" : "自定义"}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-500">描述</Label>
                      <p className="font-medium">{role.description || "暂无描述"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <Label className="text-slate-500">用户数量</Label>
                        <p className="font-medium text-2xl">{users.length}</p>
                      </div>
                      <div>
                        <Label className="text-slate-500">权限数量</Label>
                        <p className="font-medium text-2xl">{permissions.length}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 权限管理 */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>权限列表</CardTitle>
                    <CardDescription>管理角色关联的权限</CardDescription>
                  </div>
                  <Button onClick={handleAssignPermissions} disabled={assigningPermission.length === 0}>
                    <Check className="h-4 w-4 mr-2" />
                    分配选中的权限 ({assigningPermission.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([module, perms]) => (
                    <div key={module}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-600" />
                        {module}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">选择</TableHead>
                            <TableHead>权限名称</TableHead>
                            <TableHead>权限代码</TableHead>
                            <TableHead>资源</TableHead>
                            <TableHead>操作</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>当前状态</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {perms.map((perm) => (
                            <TableRow key={perm.id}>
                              <TableCell>
                                {!role.isSystem && (
                                  <input
                                    type="checkbox"
                                    checked={assigningPermission.includes(perm.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setAssigningPermission([...assigningPermission, perm.id]);
                                      } else {
                                        setAssigningPermission(
                                          assigningPermission.filter((id) => id !== perm.id)
                                        );
                                      }
                                    }}
                                  />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{perm.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{perm.code}</Badge>
                              </TableCell>
                              <TableCell>{perm.resource || "-"}</TableCell>
                              <TableCell>{perm.action}</TableCell>
                              <TableCell>
                                <Badge variant={perm.isActive ? "default" : "secondary"}>
                                  {perm.isActive ? "激活" : "禁用"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {perm.assigned ? (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    <Check className="h-3 w-3 mr-1" />
                                    已分配
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">
                                    <X className="h-3 w-3 mr-1" />
                                    未分配
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 用户列表 */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>拥有此角色的用户</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>姓名</TableHead>
                      <TableHead>用户名</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>当前角色</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                          暂无用户拥有此角色
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.username || "-"}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
