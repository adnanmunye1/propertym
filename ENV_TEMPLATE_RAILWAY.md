# Railway Environment Variables Template

## Backend Service Variables

Copy these to Railway → Backend Service → Variables:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=propertym_jwt_secret_key_minimum_32_characters_long_123456
JWT_REFRESH_SECRET=propertym_refresh_secret_key_minimum_32_chars_789012
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=${{frontend.RAILWAY_PUBLIC_DOMAIN}}
STORAGE_TYPE=local
UPLOAD_DIR=./uploads
LOG_LEVEL=info
```

**Note:** Railway will automatically replace `${{Postgres.DATABASE_URL}}` and `${{frontend.RAILWAY_PUBLIC_DOMAIN}}` with actual values.

---

## Frontend Service Variables

Copy these to Railway → Frontend Service → Variables:

```
NEXT_PUBLIC_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}/api
```

**Note:** Railway will automatically replace `${{backend.RAILWAY_PUBLIC_DOMAIN}}` with your backend URL.

---

## Important:
- JWT secrets above are examples - Railway will generate secure ones automatically, or you can use your own
- Make sure to link services so Railway can resolve the `${{}}` references

