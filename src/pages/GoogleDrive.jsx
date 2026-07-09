import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, File, ChevronLeft, Search, ExternalLink, Loader2, HardDrive, Cloud } from 'lucide-react';

export default function GoogleDrive() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [driveMode, setDriveMode] = useState('my'); // 'my' or 'shared'
  const [sharedDrives, setSharedDrives] = useState([]);
  const [activeSharedDrive, setActiveSharedDrive] = useState(null); // { id, name }

  const fetchFiles = useCallback(async (folderId, query, sharedDriveId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('listDriveFiles', {
        folder_id: folderId,
        query: query,
        shared_drive_id: sharedDriveId || null,
      });
      setFiles(res.data.files || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSharedDrives = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('listDriveFiles', {
        shared_drive_id: '__list_drives__',
      });
      setSharedDrives(res.data.drives || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load shared drives');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (driveMode === 'my') {
      setBreadcrumb([]);
      setActiveSharedDrive(null);
      fetchFiles(null, null);
    } else {
      fetchSharedDrives();
    }
  }, [driveMode, fetchFiles, fetchSharedDrives]);

  const openFolder = (file) => {
    if (file.mimeType !== 'application/vnd.google-apps.folder') return;
    setBreadcrumb((prev) => [...prev, { id: file.id, name: file.name }]);
    setActiveQuery(null);
    setSearchInput('');
    fetchFiles(file.id, null, activeSharedDrive?.id);
  };

  const navigateTo = (index) => {
    if (index === -1) {
      setBreadcrumb([]);
      fetchFiles(null, null, activeSharedDrive?.id);
    } else {
      const target = breadcrumb[index];
      setBreadcrumb(breadcrumb.slice(0, index + 1));
      fetchFiles(target.id, null, activeSharedDrive?.id);
    }
  };

  const openSharedDrive = (drive) => {
    setActiveSharedDrive(drive);
    setBreadcrumb([]);
    setActiveQuery(null);
    setSearchInput('');
    fetchFiles(null, null, drive.id);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveQuery(searchInput);
      setBreadcrumb([]);
      fetchFiles(null, searchInput.trim(), activeSharedDrive?.id);
    } else {
      setActiveQuery(null);
      fetchFiles(null, null, activeSharedDrive?.id);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Google Drive</h1>
        <p className="text-sm text-muted-foreground">Browse files from your connected Google Drive</p>
      </div>

      {/* Drive mode toggle */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-2xl p-2 w-fit">
        <button
          onClick={() => setDriveMode('my')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${driveMode === 'my' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-secondary'}`}
        >
          <Cloud size={15} /> My Drive
        </button>
        <button
          onClick={() => setDriveMode('shared')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${driveMode === 'shared' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-secondary'}`}
        >
          <HardDrive size={15} /> Shared Drives
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search files by name..."
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {activeSharedDrive && driveMode === 'shared' && !activeQuery && (
        <div className="flex items-center gap-1 text-sm flex-wrap">
          <button onClick={() => { setActiveSharedDrive(null); setBreadcrumb([]); fetchSharedDrives(); }} className="text-primary hover:underline">Shared Drives</button>
          <ChevronLeft className="h-3 w-3 rotate-180" />
          <span className="font-medium">{activeSharedDrive.name}</span>
        </div>
      )}

      {breadcrumb.length > 0 && !activeQuery && (
        <div className="flex items-center gap-1 text-sm flex-wrap">
          <button onClick={() => navigateTo(-1)} className="text-primary hover:underline">My Drive</button>
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.id} className="flex items-center gap-1">
              <ChevronLeft className="h-3 w-3 rotate-180" />
              <button
                onClick={() => navigateTo(i)}
                className={i === breadcrumb.length - 1 ? 'font-medium' : 'text-primary hover:underline'}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>
      )}

      {error && (
        <Card className="p-4 border-destructive">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : driveMode === 'shared' && !activeSharedDrive ? (
        sharedDrives.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            No shared drives found.
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sharedDrives.map((drive) => (
              <Card
                key={drive.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => openSharedDrive(drive)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <HardDrive className="h-10 w-10 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={drive.name}>{drive.name}</p>
                    <p className="text-xs text-muted-foreground">Shared Drive</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : files.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No files found.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => {
            const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
            return (
              <Card
                key={file.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => (isFolder ? openFolder(file) : window.open(file.webViewLink, '_blank'))}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {isFolder ? (
                      <Folder className="h-10 w-10 text-blue-500" />
                    ) : file.thumbnailLink ? (
                      <img src={file.thumbnailLink} alt={file.name} className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <File className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isFolder ? 'Folder' : formatSize(file.size)}
                    </p>
                    {!isFolder && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-3 w-3" /> Open in Drive
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}