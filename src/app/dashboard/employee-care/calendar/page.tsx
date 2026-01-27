'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Cake,
  Briefcase,
  Award,
  Heart,
  GraduationCap,
  Star,
  Users,
  Eye,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';

type EventType = 'birthday' | 'work-anniversary' | 'holiday' | 'training' | 'meeting' | 'other';

interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  description?: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  allDay?: boolean;
}

export default function EmployeeCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'birthday' as EventType,
    date: '',
    description: '',
    employeeName: '',
    department: '',
    allDay: true,
  });

  useEffect(() => {
    // 模拟获取日历事件数据
    setTimeout(() => {
      setEvents([
        {
          id: '1',
          title: '张三生日',
          type: 'birthday',
          date: '2024-01-15',
          employeeId: 'E001',
          employeeName: '张三',
          department: '技术部',
          allDay: true,
        },
        {
          id: '2',
          title: '李四入职3周年',
          type: 'work-anniversary',
          date: '2024-01-20',
          employeeId: 'E002',
          employeeName: '李四',
          department: '产品部',
          allDay: true,
        },
        {
          id: '3',
          title: '春节假期',
          type: 'holiday',
          date: '2024-02-10',
          description: '2024年春节假期：2月10日-2月17日',
          allDay: true,
        },
        {
          id: '4',
          title: '技术培训：AI技术分享',
          type: 'training',
          date: '2024-01-25',
          description: 'AI技术在企业中的应用',
          allDay: false,
        },
        {
          id: '5',
          title: '王五生日',
          type: 'birthday',
          date: '2024-01-28',
          employeeId: 'E003',
          employeeName: '王五',
          department: '销售部',
          allDay: true,
        },
        {
          id: '6',
          title: '月度例会',
          type: 'meeting',
          date: '2024-01-30',
          description: '公司月度工作会议',
          allDay: false,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateEvent = () => {
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      type: newEvent.type,
      date: newEvent.date,
      description: newEvent.description,
      employeeName: newEvent.employeeName,
      department: newEvent.department,
      allDay: newEvent.allDay,
    };
    setEvents([...events, event]);
    setShowCreateEvent(false);
    toast.success('事件已添加');
    setNewEvent({
      title: '',
      type: 'birthday',
      date: '',
      description: '',
      employeeName: '',
      department: '',
      allDay: true,
    });
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeConfig: Record<EventType, { label: string; color: string; icon: any; bgColor: string }> = {
    birthday: {
      label: '生日',
      color: 'bg-pink-500',
      icon: Cake,
      bgColor: 'bg-pink-50 dark:bg-pink-950',
    },
    'work-anniversary': {
      label: '入职周年',
      color: 'bg-purple-500',
      icon: Briefcase,
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    holiday: {
      label: '假期',
      color: 'bg-green-500',
      icon: Award,
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    training: {
      label: '培训',
      color: 'bg-blue-500',
      icon: GraduationCap,
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    meeting: {
      label: '会议',
      color: 'bg-yellow-500',
      icon: Users,
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    other: {
      label: '其他',
      color: 'bg-gray-500',
      icon: Star,
      bgColor: 'bg-gray-50 dark:bg-gray-950',
    },
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // 填充月初空白
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: null, events: [] });
    }

    // 填充月中的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter((event) => event.date === currentDateStr);
      days.push({ date: day, events: dayEvents, dateStr: currentDateStr });
    }

    return days;
  };

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const statistics = {
    totalEvents: events.length,
    birthdays: events.filter((e) => e.type === 'birthday').length,
    anniversaries: events.filter((e) => e.type === 'work-anniversary').length,
    trainings: events.filter((e) => e.type === 'training').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              员工日历
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              管理员工生日、入职周年、培训等事件
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('导出中...')}>
              <Filter className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => setShowCreateEvent(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加事件
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">总事件数</p>
                  <p className="text-2xl font-bold">{statistics.totalEvents}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">生日</p>
                  <p className="text-2xl font-bold text-pink-600">{statistics.birthdays}</p>
                </div>
                <Cake className="h-8 w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">入职周年</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.anniversaries}</p>
                </div>
                <Briefcase className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">培训</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.trainings}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索事件..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.entries(typeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 日历视图 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  今天
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-gray-600 dark:text-gray-400">加载中...</div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {/* 星期标题 */}
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center py-2 font-medium text-sm text-gray-600 dark:text-gray-400"
                  >
                    {day}
                  </div>
                ))}

                {/* 日期格子 */}
                {getDaysInMonth(currentDate).map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[100px] border rounded-lg p-2 ${
                      day?.date ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700' : 'bg-gray-100 dark:bg-gray-900'
                    } transition-colors`}
                  >
                    {day?.date && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-sm font-medium ${
                              day.dateStr === new Date().toISOString().split('T')[0]
                                ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                                : ''
                            }`}
                          >
                            {day.date}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {day.events.slice(0, 3).map((event) => {
                            const EventIcon = typeConfig[event.type].icon;
                            return (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded cursor-pointer ${typeConfig[event.type].bgColor} hover:opacity-80 transition-opacity`}
                                onClick={() => setSelectedEvent(event)}
                              >
                                <div className="flex items-center gap-1">
                                  <EventIcon className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{event.title}</span>
                                </div>
                              </div>
                            );
                          })}
                          {day.events.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{day.events.length - 3} 更多
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 最近事件 */}
        <Card>
          <CardHeader>
            <CardTitle>最近事件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEvents.slice(0, 5).map((event) => {
                const EventIcon = typeConfig[event.type].icon;
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${typeConfig[event.type].bgColor}`}
                    >
                      <EventIcon className={`h-5 w-5 text-${event.type === 'birthday' ? 'pink' : 'blue'}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.date}
                        {event.employeeName && ` · ${event.employeeName}`}
                      </p>
                    </div>
                    <Badge className={`${typeConfig[event.type].color} text-white border-0`}>
                      {typeConfig[event.type].label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 创建事件弹窗 */}
      <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加事件</DialogTitle>
            <DialogDescription>
              添加新的日历事件
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>事件标题 *</Label>
              <Input
                placeholder="输入事件标题"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>事件类型 *</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(v) => setNewEvent({ ...newEvent, type: v as EventType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>日期 *</Label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>员工姓名</Label>
                <Input
                  placeholder="输入员工姓名（可选）"
                  value={newEvent.employeeName}
                  onChange={(e) => setNewEvent({ ...newEvent, employeeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>部门</Label>
                <Input
                  placeholder="输入部门（可选）"
                  value={newEvent.department}
                  onChange={(e) => setNewEvent({ ...newEvent, department: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>描述</Label>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                placeholder="输入事件描述..."
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={newEvent.allDay}
                onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="allDay" className="cursor-pointer">
                全天事件
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
              取消
            </Button>
            <Button onClick={handleCreateEvent}>
              <Plus className="h-4 w-4 mr-2" />
              添加事件
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看事件详情弹窗 */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`${typeConfig[selectedEvent.type].color} text-white border-0`}>
                  {typeConfig[selectedEvent.type].label}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedEvent.date}
                </span>
              </div>

              {selectedEvent.employeeName && (
                <div>
                  <Label>员工</Label>
                  <p className="text-sm">
                    {selectedEvent.employeeName}
                    {selectedEvent.department && ` · ${selectedEvent.department}`}
                  </p>
                </div>
              )}

              {selectedEvent.description && (
                <div>
                  <Label>描述</Label>
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  编辑
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
