'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResponsiveImage } from '@/components/performance/optimized-image';
import { Activity, Users, Clock, TrendingUp, Briefcase, GraduationCap, FileText, Calendar } from 'lucide-react';

interface QuickStat {
  title: string;
  value: string | number;
  change: string;
  icon: any;
  color: string;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  time: string;
  user: string;
  avatar: string | null;
}

interface Todo {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
}

export default function DashboardOverview() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const quickStats: QuickStat[] = [
    { title: '员工总数', value: 156, change: '+12%', icon: Users, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900' },
    { title: '本月入职', value: 8, change: '+3', icon: Briefcase, color: 'text-green-600 bg-green-100 dark:bg-green-900' },
    { title: '待办事项', value: 24, change: '-5', icon: FileText, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900' },
    { title: '培训课程', value: 12, change: '+2', icon: GraduationCap, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900' },
  ];

  const recentActivities: RecentActivity[] = [
    { id: '1', type: 'recruit', title: '新候选人申请: 张三 - 高级工程师', time: '5分钟前', user: '张三', avatar: null },
    { id: '2', type: 'leave', title: '李四提交了请假申请', time: '15分钟前', user: '李四', avatar: null },
    { id: '3', type: 'review', title: '王五完成了绩效自评', time: '30分钟前', user: '王五', avatar: null },
    { id: '4', type: 'training', title: '新员工培训课程已创建', time: '1小时前', user: 'HR团队', avatar: null },
    { id: '5', type: 'salary', title: '3月工资发放完成', time: '2小时前', user: '财务部', avatar: null },
  ];

  const todos: Todo[] = [
    { id: '1', title: '审核候选人面试结果', priority: 'high', deadline: '今天' },
    { id: '2', title: '批准李四的请假申请', priority: 'high', deadline: '今天' },
    { id: '3', title: '完成季度绩效评估', priority: 'medium', deadline: '本周五' },
    { id: '4', title: '更新员工培训计划', priority: 'medium', deadline: '下周' },
    { id: '5', title: '准备月度薪酬报告', priority: 'low', deadline: '月底' },
  ];

  const priorityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">工作台</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {time.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}
            {time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <Button>
          <Activity size={16} className="mr-2" />
          刷新数据
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <TrendingUp size={12} className="inline mr-1" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>最近动态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="shrink-0">
                    {activity.avatar ? (
                      <ResponsiveImage src={activity.avatar} alt={activity.user} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                        {activity.user.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {activity.type === 'recruit' && '招聘'}
                    {activity.type === 'leave' && '考勤'}
                    {activity.type === 'review' && '绩效'}
                    {activity.type === 'training' && '培训'}
                    {activity.type === 'salary' && '薪酬'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>待办事项</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todos.map((todo) => (
                <div key={todo.id} className="p-3 rounded-lg border dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{todo.title}</h4>
                    <Badge className={priorityColors[todo.priority]} variant="secondary">
                      {todo.priority === 'high' && '高'}
                      {todo.priority === 'medium' && '中'}
                      {todo.priority === 'low' && '低'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar size={12} />
                    <span>{todo.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm">
              查看全部待办事项
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
