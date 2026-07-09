import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Mail, Search, Send, Inbox, Star, Loader2, ArrowLeft, Paperclip,
  ChevronRight, RefreshCw, X, Clock
} from 'lucide-react';

export default function Gmail() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [compose, setCompose] = useState({ to: '', subject: '', body: '', cc: '', bcc: '' });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const fetchMessages = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('gmailMessages', {
        action: 'list',
        maxResults: 30,
        query: query || '',
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load emails');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages('');
  }, [fetchMessages]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveQuery(searchInput.trim());
    fetchMessages(searchInput.trim());
  };

  const openMessage = async (msg) => {
    setMessageLoading(true);
    setSelectedMessage(null);
    try {
      const res = await base44.functions.invoke('gmailMessages', {
        action: 'get',
        messageId: msg.id,
      });
      setSelectedMessage(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load message');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSend = async () => {
    if (!compose.to || !compose.subject || !compose.body) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await base44.functions.invoke('gmailMessages', {
        action: 'send',
        to: compose.to,
        subject: compose.subject,
        body: compose.body,
        cc: compose.cc || undefined,
        bcc: compose.bcc || undefined,
      });
      setSendResult({ success: true, message: 'Email sent successfully!' });
      setCompose({ to: '', subject: '', body: '', cc: '', bcc: '' });
      setTimeout(() => {
        setShowCompose(false);
        setSendResult(null);
        fetchMessages(activeQuery);
      }, 1500);
    } catch (err) {
      setSendResult({ success: false, message: err.response?.data?.error || err.message || 'Failed to send email' });
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };

  const parseFrom = (fromStr) => {
    if (!fromStr) return { name: '', email: '' };
    const match = fromStr.match(/^(.*?)\s*<(.+)>$/);
    if (match) return { name: match[1].replace(/"/g, '').trim(), email: match[2] };
    return { name: fromStr, email: fromStr };
  };

  if (selectedMessage) {
    const from = parseFrom(selectedMessage.from);
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedMessage(null)} className="gap-2">
            <ArrowLeft size={16} /> Back to Inbox
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setCompose({ to: from.email, subject: `Re: ${selectedMessage.subject}`, body: '', cc: '', bcc: '' }); setShowCompose(true); setSelectedMessage(null); }} className="gap-2">
            <Send size={14} /> Reply
          </Button>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-black text-foreground mb-3">{selectedMessage.subject}</h1>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {from.name?.charAt(0)?.toUpperCase() || from.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{from.name || from.email}</p>
                <p className="text-xs text-muted-foreground">{from.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">to {selectedMessage.to}</p>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                <Clock size={12} /> {formatDate(selectedMessage.date)}
              </span>
            </div>
          </div>
          <div className="p-6">
            {selectedMessage.bodyHtml ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }} />
            ) : (
              <p className="text-sm text-foreground whitespace-pre-wrap">{selectedMessage.bodyText || selectedMessage.snippet}</p>
            )}
          </div>
          {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
            <div className="px-6 pb-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><Paperclip size={12} /> Attachments</p>
              <div className="space-y-1">
                {selectedMessage.attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 text-sm">
                    <Paperclip size={14} className="text-muted-foreground" />
                    <span className="font-medium">{att.filename}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{att.size ? `${(att.size / 1024).toFixed(1)} KB` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showCompose) {
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-foreground flex items-center gap-2"><Send size={20} /> Compose Email</h1>
          <Button variant="ghost" onClick={() => { setShowCompose(false); setSendResult(null); }} className="gap-1"><X size={16} /> Close</Button>
        </div>

        {sendResult && (
          <div className={`rounded-xl p-4 ${sendResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            <p className="text-sm font-bold">{sendResult.message}</p>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div>
            <Label className="text-xs">To *</Label>
            <Input value={compose.to} onChange={e => setCompose({ ...compose, to: e.target.value })} placeholder="recipient@email.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Cc</Label>
              <Input value={compose.cc} onChange={e => setCompose({ ...compose, cc: e.target.value })} placeholder="cc@email.com" />
            </div>
            <div>
              <Label className="text-xs">Bcc</Label>
              <Input value={compose.bcc} onChange={e => setCompose({ ...compose, bcc: e.target.value })} placeholder="bcc@email.com" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Subject *</Label>
            <Input value={compose.subject} onChange={e => setCompose({ ...compose, subject: e.target.value })} placeholder="Email subject" />
          </div>
          <div>
            <Label className="text-xs">Message *</Label>
            <Textarea value={compose.body} onChange={e => setCompose({ ...compose, body: e.target.value })} placeholder="Write your message..." className="min-h-[200px]" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={!compose.to || !compose.subject || !compose.body || sending} className="gap-2">
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              Send Email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Mail size={24} className="text-primary" /> Gmail</h1>
          <p className="text-sm text-muted-foreground">{activeQuery ? `Search results for "${activeQuery}"` : 'Your connected Gmail inbox'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchMessages(activeQuery)} className="gap-1.5"><RefreshCw size={14} /> Refresh</Button>
          <Button size="sm" onClick={() => setShowCompose(true)} className="gap-1.5"><Send size={14} /> Compose</Button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search emails by subject, sender, or content..."
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">Search</Button>
        {activeQuery && (
          <Button type="button" variant="ghost" onClick={() => { setSearchInput(''); setActiveQuery(''); fetchMessages(''); }}>Clear</Button>
        )}
      </form>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Messages */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Inbox size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{activeQuery ? 'No emails match your search.' : 'No emails found.'}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {messages.map((msg) => {
            const from = parseFrom(msg.from);
            return (
              <button
                key={msg.id}
                onClick={() => openMessage(msg)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${msg.unread ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {from.name?.charAt(0)?.toUpperCase() || from.email?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm truncate ${msg.unread ? 'font-black text-foreground' : 'font-medium text-muted-foreground'}`}>
                      {from.name || from.email}
                    </p>
                    {msg.starred && <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />}
                    <span className="text-xs text-muted-foreground ml-auto shrink-0">{formatDate(msg.date)}</span>
                  </div>
                  <p className={`text-sm truncate ${msg.unread ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                    {msg.subject}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{msg.snippet}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}