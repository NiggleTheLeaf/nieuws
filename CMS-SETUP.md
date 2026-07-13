# The Mopane newsroom setup

The public site remains functional with its bundled story catalogue before setup. The live newsroom, support form and analytics activate after the steps below.

## 1. Create the backend

1. Create a Supabase project.
2. Open **SQL Editor** and run the complete `supabase-setup.sql` file once.
3. Open **Authentication → Users** and create your private admin email/password user.
4. Copy that user's UUID.
5. In SQL Editor, run the final commented `insert into public.profiles...` statement from `supabase-setup.sql`, replacing the UUID and name.
6. In Authentication settings, disable public email sign-ups. The admin page contains no registration form regardless.

## 2. Connect the website

In **Project Settings → API**, copy the Project URL and the public anon/publishable key. Add them to `site-config.js`:

```js
window.MOPANE_CONFIG = {
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR-PUBLIC-ANON-KEY',
  supportEmail: 'support@yourdomain.com'
};
```

Never place a `service_role` or secret key in this file. The public key is safe to expose only because `supabase-setup.sql` enables restrictive Row Level Security policies.

Commit and push the new site files to GitHub Pages. Open `https://yourdomain.com/admin.html` and sign in.

## 3. Preserve the existing archive

On the first login only:

1. Open **Stories**.
2. Select **Seed bundled archive**.

This copies the existing twelve stories into the database. Their old links remain valid.

## 4. Publish stories

- Write directly in the admin editor; there is no practical short-story limit.
- Or copy `example-story.md`, create as many Markdown files as needed, and select all of them under **Batch Markdown import**.
- Imported stories default to draft unless their front matter says `status: published`.
- The archive retains all published stories.
- The homepage automatically shows the newest twelve.
- Under **Front page**, drag stories into the desired order and select **Save order**. The first five populate “Stories shaping the continent.”

See `STORY-FORMAT.md` for the exact format.

## 5. Analytics and support

The site records privacy-light page views and a random browser session identifier. It does not record IP addresses. Visitors with browser Do Not Track enabled are not counted.

Support form submissions appear under **Support** in the admin panel. Staff can mark tickets open, in progress or closed.

## Security boundary

Anyone can technically request the static `admin.html` file, just as they can request any public URL. They cannot read or change newsroom data without a valid staff login. Supabase authentication and database Row Level Security enforce that boundary; hiding the filename is not the security mechanism.
