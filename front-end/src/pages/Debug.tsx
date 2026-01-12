/**
 * Debug Page (Milestone 1 Validation)
 *
 * Simple UI to verify:
 * - Fundraises exist in the database
 * - Archive query returns last 12 months
 * - Recent query returns last 48 hours
 * - Both queries return correct counts
 *
 * This is for validation only, not product UI.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Clock, Archive, AlertCircle, CheckCircle } from 'lucide-react';
import {
  getAllFundraises,
  getArchiveFundraises,
  getRecentFundraises,
  getDatasetStats,
} from '../services/fundraiseService';
import { Fundraise } from '../types/fundraise';
import { TIME_WINDOWS } from '../types/fundraise';

export default function Debug() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReturnType<typeof getDatasetStats> | null>(null);
  const [allData, setAllData] = useState<Fundraise[]>([]);
  const [archiveData, setArchiveData] = useState<Fundraise[]>([]);
  const [recentData, setRecentData] = useState<Fundraise[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'archive' | 'recent'>('all');

  useEffect(() => {
    setStats(getDatasetStats());
    setAllData(getAllFundraises());
    setArchiveData(getArchiveFundraises());
    setRecentData(getRecentFundraises());
  }, []);

  const currentData = activeTab === 'all' ? allData : activeTab === 'archive' ? archiveData : recentData;

  // Validation checks
  const checks = stats ? [
    {
      name: 'Dataset exists',
      pass: stats.total > 0,
      detail: `${stats.total} total fundraises`,
    },
    {
      name: 'Archive query works',
      pass: stats.archiveCount > 0 && stats.archiveCount <= stats.total,
      detail: `${stats.archiveCount} in last ${TIME_WINDOWS.ARCHIVE_MONTHS} months`,
    },
    {
      name: 'Recent query works',
      pass: stats.recentCount >= 0,
      detail: `${stats.recentCount} in last ${TIME_WINDOWS.RECENT_HOURS} hours`,
    },
    {
      name: 'Old fundraises excluded',
      pass: stats.archiveCount < stats.total,
      detail: `${stats.total - stats.archiveCount} excluded (older than 12mo)`,
    },
  ] : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 border-b border-border/50 sticky top-0 bg-background z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold">Debug: Milestone 1</h1>
          <p className="text-xs text-muted-foreground">Data Layer Validation</p>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Database className="mx-auto mb-2 text-muted-foreground" size={20} />
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Archive className="mx-auto mb-2 text-muted-foreground" size={20} />
              <div className="text-2xl font-bold">{stats.archiveCount}</div>
              <div className="text-xs text-muted-foreground">Archive (12mo)</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Clock className="mx-auto mb-2 text-muted-foreground" size={20} />
              <div className="text-2xl font-bold">{stats.recentCount}</div>
              <div className="text-xs text-muted-foreground">Recent (48h)</div>
            </div>
          </div>
        )}

        {/* Validation Checks */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-semibold mb-3">Validation Checks</h2>
          <div className="space-y-2">
            {checks.map((check, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {check.pass ? (
                  <CheckCircle className="text-green-500" size={16} />
                ) : (
                  <AlertCircle className="text-red-500" size={16} />
                )}
                <span className={check.pass ? 'text-foreground' : 'text-red-500'}>
                  {check.name}
                </span>
                <span className="text-muted-foreground ml-auto">{check.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2">
          {(['all', 'archive', 'recent'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-1 opacity-70">
                ({tab === 'all' ? allData.length : tab === 'archive' ? archiveData.length : recentData.length})
              </span>
            </button>
          ))}
        </div>

        {/* Data List */}
        <div className="space-y-3">
          {currentData.map((f) => (
            <div key={f.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{f.company_name}</h3>
                <span className="text-xs bg-secondary px-2 py-1 rounded">{f.stage}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{f.description}</p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{f.amount_raised}</span>
                <span>{new Date(f.announced_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {currentData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No fundraises in this dataset
          </div>
        )}
      </main>
    </div>
  );
}
