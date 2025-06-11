"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Eye, 
  Clock, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Target,
  Zap,
  Heart,
  MessageSquare,
  Download,
  Share2,
  Calendar,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    avgReadingTime: number;
    searchQueries: number;
    satisfactionScore: number;
    bounceRate: number;
  };
  trends: {
    viewsChange: number;
    visitorsChange: number;
    readingTimeChange: number;
    satisfactionChange: number;
  };
  topContent: Array<{
    title: string;
    path: string;
    views: number;
    readingTime: number;
    satisfaction: number;
    type: 'guide' | 'reference' | 'tutorial';
  }>;
  searchAnalytics: {
    topQueries: Array<{
      query: string;
      count: number;
      successRate: number;
    }>;
    noResultsQueries: Array<{
      query: string;
      count: number;
    }>;
  };
  userJourney: Array<{
    step: string;
    users: number;
    dropoffRate: number;
  }>;
  performance: {
    avgLoadTime: number;
    coreWebVitals: {
      lcp: number;
      fid: number;
      cls: number;
    };
  };
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

export default function AnalyticsDashboard({ 
  data, 
  timeRange, 
  onTimeRangeChange 
}: AnalyticsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const getPerformanceColor = (score: number, type: 'lcp' | 'fid' | 'cls') => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    };
    
    const threshold = thresholds[type];
    if (score <= threshold.good) return 'text-green-600';
    if (score <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights into your documentation performance and user behavior
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{formatNumber(data.overview.totalViews)}</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm">
                {getTrendIcon(data.trends.viewsChange)}
                <span className={`ml-1 ${getTrendColor(data.trends.viewsChange)}`}>
                  {Math.abs(data.trends.viewsChange)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unique Visitors</p>
                  <p className="text-2xl font-bold">{formatNumber(data.overview.uniqueVisitors)}</p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm">
                {getTrendIcon(data.trends.visitorsChange)}
                <span className={`ml-1 ${getTrendColor(data.trends.visitorsChange)}`}>
                  {Math.abs(data.trends.visitorsChange)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Reading Time</p>
                  <p className="text-2xl font-bold">{formatTime(data.overview.avgReadingTime)}</p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm">
                {getTrendIcon(data.trends.readingTimeChange)}
                <span className={`ml-1 ${getTrendColor(data.trends.readingTimeChange)}`}>
                  {Math.abs(data.trends.readingTimeChange)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Search Queries</p>
                  <p className="text-2xl font-bold">{formatNumber(data.overview.searchQueries)}</p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Search className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm">
                <Target className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground ml-1">
                  {((data.searchAnalytics.topQueries.reduce((acc, q) => acc + q.successRate, 0) / data.searchAnalytics.topQueries.length) || 0).toFixed(1)}% success rate
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                  <p className="text-2xl font-bold">{data.overview.satisfactionScore.toFixed(1)}/5</p>
                </div>
                <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm">
                {getTrendIcon(data.trends.satisfactionChange)}
                <span className={`ml-1 ${getTrendColor(data.trends.satisfactionChange)}`}>
                  {Math.abs(data.trends.satisfactionChange)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                  <p className="text-2xl font-bold">{data.overview.bounceRate.toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="mt-2">
                <Progress 
                  value={100 - data.overview.bounceRate} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Top Content</TabsTrigger>
          <TabsTrigger value="search">Search Analytics</TabsTrigger>
          <TabsTrigger value="journey">User Journey</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topContent.map((content, index) => (
                  <motion.div
                    key={content.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {content.type}
                        </Badge>
                        <h3 className="font-medium">{content.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{content.path}</p>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{formatNumber(content.views)}</p>
                        <p className="text-muted-foreground">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{formatTime(content.readingTime)}</p>
                        <p className="text-muted-foreground">Avg Time</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{content.satisfaction.toFixed(1)}/5</p>
                        <p className="text-muted-foreground">Rating</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Search Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.searchAnalytics.topQueries.map((query, index) => (
                    <div key={query.query} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{query.query}</p>
                        <p className="text-sm text-muted-foreground">
                          {query.count} searches
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          query.successRate > 80 ? 'text-green-600' : 
                          query.successRate > 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {query.successRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">Success</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>No Results Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.searchAnalytics.noResultsQueries.map((query, index) => (
                    <div key={query.query} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{query.query}</p>
                        <p className="text-sm text-red-600">No results found</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{query.count}</p>
                        <p className="text-xs text-muted-foreground">Attempts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Journey Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.userJourney.map((step, index) => (
                  <div key={step.step} className="relative">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{step.step}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {formatNumber(step.users)} users
                          </span>
                          <span className={`text-sm ${
                            step.dropoffRate > 50 ? 'text-red-600' : 
                            step.dropoffRate > 25 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {step.dropoffRate}% drop-off
                          </span>
                        </div>
                      </div>
                      <div className="w-32">
                        <Progress value={100 - step.dropoffRate} className="h-2" />
                      </div>
                    </div>
                    {index < data.userJourney.length - 1 && (
                      <div className="w-px h-6 bg-border ml-4 mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Largest Contentful Paint</p>
                      <p className="text-sm text-muted-foreground">Loading performance</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getPerformanceColor(data.performance.coreWebVitals.lcp, 'lcp')}`}>
                        {(data.performance.coreWebVitals.lcp / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">First Input Delay</p>
                      <p className="text-sm text-muted-foreground">Interactivity</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getPerformanceColor(data.performance.coreWebVitals.fid, 'fid')}`}>
                        {data.performance.coreWebVitals.fid}ms
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cumulative Layout Shift</p>
                      <p className="text-sm text-muted-foreground">Visual stability</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getPerformanceColor(data.performance.coreWebVitals.cls, 'cls')}`}>
                        {data.performance.coreWebVitals.cls.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Load Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Average Load Time</p>
                      <p className="text-sm text-muted-foreground">Time to interactive</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl">
                        {(data.performance.avgLoadTime / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Excellent (&lt;1s)</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Good (1-3s)</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Needs Improvement (&gt;3s)</span>
                      <span>10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}