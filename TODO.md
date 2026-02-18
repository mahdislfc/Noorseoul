# TODO

- [ ] Apply pending Prisma migration once DB is reachable:
  - Command: `npx prisma migrate deploy`
  - Current blocker: `P1001` (cannot reach `aws-1-ap-south-1.pooler.supabase.com:5432`)
  - After success: verify `RequestedProduct` table exists and request submissions appear in Admin > Requested Products.
