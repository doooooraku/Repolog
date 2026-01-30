import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Report } from '../types';
import { Settings, Plus, Pin, MoreVertical, FileText, Sun, Cloud, CloudRain, CloudSnow, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

interface HomeProps {
  onNewReport: () => void;
  onEditReport: (report: Report) => void;
  onOpenSettings: () => void;
}

type FilterType = 'all' | 'pinned' | 'thisWeek';

export const Home: React.FC<HomeProps> = ({ onNewReport, onEditReport, onOpenSettings }) => {
  const { reports, t, deleteReport, togglePin } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    // Apply filter
    if (filter === 'pinned') {
      filtered = filtered.filter((r) => r.isPinned);
    } else if (filter === 'thisWeek') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((r) => new Date(r.createdAt) >= weekAgo);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.siteName.toLowerCase().includes(query) ||
          r.comment.toLowerCase().includes(query)
      );
    }

    // Sort: pinned first, then by date
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }, [reports, filter, searchQuery]);

  // Group by date
  const groupedReports = useMemo(() => {
    const groups: { date: string; reports: Report[] }[] = [];
    
    filteredReports.forEach((report) => {
      const dateStr = new Date(report.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
      const existingGroup = groups.find((g) => g.date === dateStr);
      
      if (existingGroup) {
        existingGroup.reports.push(report);
      } else {
        groups.push({ date: dateStr, reports: [report] });
      }
    });

    return groups;
  }, [filteredReports]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayNames = [t.sunday, t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday];
    const dayName = dayNames[date.getDay()];
    return `${dateStr} (${dayName})`;
  };

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    const dateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const timeStr = d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${dateStr} ${timeStr}`;
  };

  const getWeatherIcon = (weather: string) => {
    const iconClass = "w-4 h-4 text-gray-500";
    switch (weather) {
      case 'sunny':
        return <Sun className={iconClass} />;
      case 'cloudy':
        return <Cloud className={iconClass} />;
      case 'rainy':
        return <CloudRain className={iconClass} />;
      case 'snowy':
        return <CloudSnow className={iconClass} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* AppBar */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t.appName}</h1>
        <Button variant="ghost" size="icon" onClick={onOpenSettings}>
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      {/* Search */}
      <div className="bg-white border-b px-4 py-3">
        <Input
          type="search"
          placeholder={t.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Filter Chips */}
      <div className="bg-white border-b px-4 py-3 flex gap-2 overflow-x-auto">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          {t.allReports}
        </Button>
        <Button
          variant={filter === 'pinned' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pinned')}
        >
          {t.pinned}
        </Button>
        <Button
          variant={filter === 'thisWeek' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('thisWeek')}
        >
          {t.thisWeek}
        </Button>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {groupedReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {t.emptyStateTitle}
            </h2>
            <p className="text-gray-500">{t.emptyStateSubtitle}</p>
          </div>
        ) : (
          groupedReports.map((group) => (
            <div key={group.date} className="mb-6">
              {/* Date Header */}


              {/* Reports for this date */}
              <div className="space-y-4">
                {group.reports.map((report, index) => (
                  <div
                    key={report.id}
                    className={`rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer ${
                      report.isPinned ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white'
                    }`}
                    onClick={() => onEditReport(report)}
                  >
                    {/* Large Image */}
                    <div className="relative">
                      {report.photos.length > 0 ? (
                        <img
                          src={report.photos[0].uri}
                          alt=""
                          className="w-full aspect-[4/3] object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <FileText className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Star indicator - top right */}
                      {report.isPinned && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </div>
                      )}
                      
                      {/* Photo count badge - bottom right */}
                      {report.photos.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-sm font-semibold w-10 h-10 rounded-full flex items-center justify-center">
                          {report.photos.length}
                        </div>
                      )}
                    </div>

                    {/* Info Section */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                            {report.siteName.length > 15 ? report.siteName.slice(0, 15) + '....' : report.siteName}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{formatDateTime(report.createdAt)}</span>
                            {report.weather !== 'none' && getWeatherIcon(report.weather)}
                            {report.pdfGenerated && (
                              <Badge variant="secondary" className="text-xs">
                                PDF
                              </Badge>
                            )}
                          </div>
                          {report.comment && (
                            <p className="text-sm text-gray-600 mt-2">
                              {(() => {
                                const firstLine = report.comment.split('\n')[0];
                                return firstLine.length > 20
                                  ? firstLine.substring(0, 20) + '....'
                                  : firstLine;
                              })()}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePin(report.id);
                              }}
                            >
                              {report.isPinned ? t.unpin : t.pin}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this report?')) {
                                  deleteReport(report.id);
                                }
                              }}
                              className="text-red-600"
                            >
                              {t.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={onNewReport}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};
