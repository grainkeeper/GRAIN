# GrainKeeper Production Deployment Guide

## 🚀 Quick Start

1. **Set up environment variables** (see `env.production.example`)
2. **Run database migrations**: `node scripts/run-migration.js`
3. **Build the application**: `npm run build`
4. **Deploy**: Use the deployment script or your preferred hosting platform

## 📋 Prerequisites

- Node.js 18+ 
- Supabase project with database schema applied
- Environment variables configured
- Domain and SSL certificate (for production)

## 🔧 Environment Variables

Copy `env.production.example` to `.env.production` and fill in your values:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key

# Optional
NEXT_PUBLIC_APP_URL=https://your-domain.com
WEATHER_API_KEY=your_weather_api_key
```

## 🗄️ Database Setup

1. **Apply schema**: Run the migration script
2. **Verify tables**: Check that all tables are created
3. **Test connections**: Ensure API routes can connect to database

## 🔒 Security Checklist

- [ ] Environment variables are secure and not committed to git
- [ ] Supabase RLS (Row Level Security) is configured
- [ ] API rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Security headers are set
- [ ] SSL/TLS is enabled

## 📊 Monitoring & Analytics

### Recommended Tools:
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics or Vercel Analytics
- **Performance**: Vercel Analytics or Lighthouse
- **Uptime**: UptimeRobot or similar

### Key Metrics to Monitor:
- Application response times
- Database query performance
- Error rates
- User engagement
- API usage

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Check Supabase credentials
   - Verify database schema is applied
   - Check network connectivity

2. **Environment Variable Issues**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify variable values are correct

3. **Build Failures**
   - Check for TypeScript errors
   - Verify all dependencies are installed
   - Check for missing environment variables

### Debug Mode:
Set `NODE_ENV=development` temporarily to see detailed logs.

## 📈 Performance Optimization

### Current Optimizations:
- ✅ Code splitting and lazy loading
- ✅ Image optimization
- ✅ CSS optimization
- ✅ Bundle size optimization
- ✅ Database query optimization

### Additional Recommendations:
- Use CDN for static assets
- Implement caching strategies
- Monitor and optimize database queries
- Use compression for API responses

## 🔄 Deployment Process

### Automated (Recommended):
```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

### Manual:
```bash
npm ci --only=production
node scripts/run-migration.js
npm run build
# Deploy .next directory to your hosting provider
```

## 📞 Support

For production issues:
1. Check the logs for error details
2. Verify environment variables
3. Test database connectivity
4. Check API endpoints
5. Review monitoring dashboards

## 🎯 Success Metrics

Monitor these key performance indicators:
- **Uptime**: >99.9%
- **Response Time**: <2 seconds
- **Error Rate**: <1%
- **User Satisfaction**: >4.0/5.0
- **Feature Adoption**: >60% of users use core features
