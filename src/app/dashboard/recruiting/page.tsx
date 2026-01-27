'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  DollarSign,
  Clock,
  Users,
  ChevronRight,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { usePageData } from '@/hooks/use-page';

interface Position {
  id: string;
  title: string;
  department: string;
  location: string;
  salaryRange: string;
  status: 'active' | 'closed' | 'draft';
  applicants: number;
  postedDate: string;
}

interface Candidate {
  id: string;
  name: string;
  positionId: string;
  position: string;
  status: 'applied' | 'interview' | 'offered' | 'rejected' | 'hired';
  email: string;
  phone: string;
  experience: string;
  appliedDate: string;
}

export default function RecruitingPage() {
  const [positions] = useState<Position[]>([
    {
      id: '1',
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      location: 'Beijing',
      salaryRange: '25k-40k',
      status: 'active',
      applicants: 15,
      postedDate: '2024-01-15',
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'Product',
      location: 'Shanghai',
      salaryRange: '30k-50k',
      status: 'active',
      applicants: 8,
      postedDate: '2024-01-10',
    },
  ]);

  const [candidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      positionId: '1',
      position: 'Senior Frontend Engineer',
      status: 'interview',
      email: 'alice@example.com',
      phone: '13800138000',
      experience: '5 years',
      appliedDate: '2024-01-20',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredPositions = useMemo(() => {
    let filtered = [...positions];

    if (debouncedSearch) {
      filtered = filtered.filter(
        (pos) =>
          pos.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          pos.department.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((pos) => pos.status === statusFilter);
    }

    return filtered;
  }, [positions, debouncedSearch, statusFilter]);

  const filteredCandidates = useMemo(() => {
    let filtered = [...candidates];

    if (debouncedSearch) {
      filtered = filtered.filter(
        (cand) =>
          cand.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          cand.position.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((cand) => cand.status === statusFilter);
    }

    return filtered;
  }, [candidates, debouncedSearch, statusFilter]);

  const stats = useMemo(() => ({
    totalPositions: positions.length,
    activePositions: positions.filter((p) => p.status === 'active').length,
    totalCandidates: candidates.length,
    newApplications: candidates.filter((c) => c.status === 'applied').length,
  }), [positions, candidates]);

  if (!positions || !candidates) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recruiting</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Job posting and candidate management</p>
        </div>
        <Dialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Post Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Job Position</DialogTitle>
              <DialogDescription>Post a new job opening</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input placeholder="e.g., Senior Frontend Engineer" />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input placeholder="e.g., Engineering" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="e.g., Beijing" />
                </div>
                <div className="space-y-2">
                  <Label>Salary Range</Label>
                  <Input placeholder="e.g., 25k-40k" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Job Description</Label>
                <Textarea placeholder="Describe the role and responsibilities..." rows={6} />
              </div>
              <div className="space-y-2">
                <Label>Requirements</Label>
                <Textarea placeholder="List the requirements (one per line)..." rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateJobOpen(false)}>
                Cancel
              </Button>
              <Button>Post Job</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPositions}</div>
            <p className="text-xs text-muted-foreground">{stats.activePositions} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">{stats.newApplications} new</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter((c) => c.status === 'interview').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter((c) => c.status === 'hired').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Open Positions</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search positions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPositions.map((position) => (
              <div
                key={position.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => setSelectedPosition(position)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">{position.title}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{position.department}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {position.location}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} />
                        {position.salaryRange}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={position.status === 'active' ? 'default' : 'secondary'}>
                    {position.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users size={14} />
                    <span>{position.applicants} applicants</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => setSelectedCandidate(candidate)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{candidate.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{candidate.position}</span>
                      <span>·</span>
                      <span>{candidate.experience} exp</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      candidate.status === 'hired'
                        ? 'default'
                        : candidate.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {candidate.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>{candidate.appliedDate}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedPosition} onOpenChange={() => setSelectedPosition(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Position Details</DialogTitle>
          </DialogHeader>
          {selectedPosition && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedPosition.title}</h3>
                <p className="text-sm text-gray-500">{selectedPosition.department}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{selectedPosition.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Salary Range</p>
                  <p className="font-medium">{selectedPosition.salaryRange}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={selectedPosition.status === 'active' ? 'default' : 'secondary'}>
                    {selectedPosition.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Applicants</p>
                  <p className="font-medium">{selectedPosition.applicants}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Posted Date</p>
                <p className="font-medium">{selectedPosition.postedDate}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedCandidate.name}</h3>
                <p className="text-sm text-gray-500">{selectedCandidate.position}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedCandidate.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedCandidate.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{selectedCandidate.experience}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge
                    variant={
                      selectedCandidate.status === 'hired'
                        ? 'default'
                        : selectedCandidate.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {selectedCandidate.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Applied Date</p>
                <p className="font-medium">{selectedCandidate.appliedDate}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
