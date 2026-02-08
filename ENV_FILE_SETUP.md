# 🔑 How to Fill Your .env File

## Complete Step-by-Step Guide

### Step 1: Get Your Supabase Credentials

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Sign in with your account

2. **Select Your Project**
   - Click on your WasteExchange project
   - You should see the project name at the top

3. **Go to Settings → API**
   - Click **Settings** in the left sidebar
   - Click **API** tab
   - You'll see your credentials here

### Step 2: Copy Your Project URL

In the **Settings → API** page, look for:

```
Project URL
https://ixkmbxhtaltsjggtzzat.supabase.co
```

This is your **SUPABASE_URL**

✅ Copy this entire URL including `https://`

### Step 3: Copy Your Anon Public Key

In the same **Settings → API** page, look for:

```
Anon public key
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
```

This is your **SUPABASE_KEY**

⚠️ **IMPORTANT**: Do NOT copy the `service_role secret` - that's a different key!
Always use the `Anon public key` (listed under it)

### Step 4: Edit Your .env File

Open `Backend/.env` in VS Code or any text editor.

Find these lines:
```env
SUPABASE_URL=https://ixkmbxhtaltsjggtzzat.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with YOUR actual values:

**BEFORE** (template):
```env
SUPABASE_URL=https://ixkmbxhtaltsjggtzzat.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**AFTER** (your actual values):
```env
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_KEY=YOUR-ANON-PUBLIC-KEY
```

### Example (DO NOT USE - This is an example!)

If your Supabase dashboard shows:
- Project URL: `https://my-project.supabase.co`
- Anon public key: `eeyJhAAAA...`

Then your `.env` should be:
```env
SUPABASE_URL=https://my-project.supabase.co
SUPABASE_KEY=eeyJhAAAA...
```

### Step 5: Save and Restart Backend

1. **Save the file** (Ctrl+S)
2. **Stop the backend** (Ctrl+C in terminal)
3. **Reinstall dependencies** (new supabase package):
   ```bash
   cd Backend
   pip install -r requirements.txt
   ```
4. **Start backend**:
   ```bash
   python -m uvicorn main:app --reload
   ```

### Step 6: Verify Connection

Run this in terminal:
```bash
curl http://localhost:8000/api/db/status
```

You should see:
```json
{
  "storage_backend": "supabase",
  "supabase_configured": true,
  "supabase_connected": true,
  "supabase_url": "https://your-project.supabase.co",
  "supabase_health": "healthy"
}
```

If you see `"supabase_connected": true`, you're done! ✅

---

## 🎯 Quick Checklist

- [ ] Logged into https://app.supabase.com
- [ ] Selected my project
- [ ] Went to Settings → API
- [ ] Copied Project URL (format: `https://xxxxx.supabase.co`)
- [ ] Copied Anon Public Key (NOT the service_role secret)
- [ ] Edited `Backend/.env` file
- [ ] Replaced both SUPABASE_URL and SUPABASE_KEY with my values
- [ ] Saved the file
- [ ] Restarted backend with `pip install -r requirements.txt`
- [ ] Tested with `curl http://localhost:8000/api/db/status`
- [ ] Saw `"supabase_connected": true`

---

## ❌ Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Using `service_role secret` | Wrong key type | Use the `anon public key` instead |
| Forgetting `https://` | Invalid URL | Include `https://` at the start |
| Forgetting to save `.env` | Changes not applied | Press Ctrl+S |
| Not restarting backend | Old config still running | Stop and restart the backend |
| Missing quotes | Config parsing error | Don't use quotes around values |
| Wrong project | Connecting to wrong database | Double-check project name |

---

## 🔍 How to Double-Check

**In Supabase Console**:
1. Go to Settings → API
2. You should see THREE keys:
   - ✅ Your Project URL (this is SUPABASE_URL)
   - ✅ Anon public key (this is SUPABASE_KEY) 
   - ❌ service_role secret (DO NOT USE)

**Make sure you're copying the RIGHT key!**

---

## 📝 Example .env File

Here's what a correctly filled `.env` should look like:

```env
# WasteExchange Backend Configuration
# 
# Note: These are EXAMPLE values. Replace with your actual credentials!

SUPABASE_URL=https://ixkmbxhtaltsjggtzzat.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInN...

PORT=8000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:5173
```

---

## 🆘 Still Having Trouble?

1. **Re-read SUPABASE_SETUP.md** - Detailed step-by-step instructions
2. **Check Supabase Status Page** - https://status.supabase.com
3. **Review Backend Logs** - Terminal where you started the backend
4. **Test with curl** - Use `curl http://localhost:8000/api/db/status`
5. **Check .env syntax** - Make sure it's plain text, no special characters

---

## 🎉 Once It Works

You should be able to:
✅ Create waste listings that save to Supabase
✅ See data in Supabase dashboard
✅ Retrieve listings from backend
✅ Get recommendations for buyers
✅ Track transactions

**Congratulations!** Your WasteExchange app is now fully integrated with Supabase! 🚀

---

**Last Updated**: February 8, 2024
