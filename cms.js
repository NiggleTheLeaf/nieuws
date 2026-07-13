(function () {
  const config = window.MOPANE_CONFIG || {};
  const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase?.createClient);
  const client = configured ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;

  function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function toSiteStory(row) {
    const body = Array.isArray(row.body) ? row.body : String(row.body || '').split(/\n\s*\n/).filter(Boolean);
    const words = body.join(' ').trim().split(/\s+/).filter(Boolean).length;
    return {
      id: row.slug,
      title: row.title,
      dek: row.dek,
      country: row.country,
      city: row.city,
      section: row.section,
      author: row.author,
      published: row.published_at,
      updated: row.updated_at,
      time: formatDate(row.published_at),
      read: `${Math.max(1, Math.ceil(words / 220))} min`,
      body,
      featuredRank: row.featured_rank,
      status: row.status
    };
  }

  async function publishedStories() {
    if (!client) return [];
    const { data, error } = await client.from('stories').select('*').eq('status', 'published').order('published_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toSiteStory);
  }

  async function storyBySlug(slug) {
    if (!client) return null;
    const { data, error } = await client.from('stories').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
    if (error) throw error;
    return data ? toSiteStory(data) : null;
  }

  async function trackView(storyId) {
    if (!client || navigator.doNotTrack === '1') return;
    const referrer = document.referrer ? new URL(document.referrer).hostname : '';
    let sessionId = localStorage.getItem('mopane_session');
    if (!sessionId) {
      sessionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem('mopane_session', sessionId);
    }
    await client.from('page_views').insert({ path: location.pathname, story_slug: storyId || null, referrer, session_id: sessionId }).then(() => {}).catch(() => {});
  }

  async function submitTicket(ticket) {
    if (!client) throw new Error('Support is not configured yet.');
    const { error } = await client.from('support_tickets').insert({
      name: ticket.name,
      email: ticket.email,
      subject: ticket.subject,
      message: ticket.message,
      status: 'open'
    });
    if (error) throw error;
  }

  window.MopaneCMS = { configured, client, publishedStories, storyBySlug, trackView, submitTicket, toSiteStory };
})();
