# 🔒 Security & Compliance Audit

> This document tracks security gaps, compliance requirements, and hardening steps for AgriShield AI.

---

## Security Assessment Summary

| Area | Current Status | Risk Level |
|---|---|---|
| Authentication | ❌ None | 🔴 Critical |
| Authorization | ❌ UI-only role toggle | 🔴 Critical |
| API Security | ❌ Open endpoints, no rate limiting | 🔴 Critical |
| Data Encryption | ❌ HTTP only, no TLS | 🟠 High |
| Secrets Management | ⚠️ `.env.example` only, no vault | 🟠 High |
| Input Validation | ✅ Pydantic on backend | 🟢 Low |
| CORS | ✅ Configured, restrictive defaults | 🟢 Low |
| Dependency Security | ⚠️ Not audited | 🟠 Medium |
| Data Privacy | ⚠️ No PII policy | 🟠 Medium |

---

## Critical Vulnerabilities

### SEC-001: No Authentication
- **Risk:** Anyone can access all endpoints and admin functionality
- **Impact:** Data manipulation, unauthorized predictions, abuse
- **Fix:**
  - [ ] Implement Firebase Auth or Auth0
  - [ ] Add JWT token validation middleware to FastAPI
  - [ ] Require authentication for all non-public endpoints
  - [ ] Implement session management with secure cookie settings

### SEC-002: No Authorization / RBAC
- **Risk:** Role switcher is client-side only — no server enforcement
- **Impact:** Any user can access admin functions by modifying client state
- **Fix:**
  - [ ] Define role hierarchy: Admin > Farmer > Consumer
  - [ ] Add role claims to JWT tokens
  - [ ] Create FastAPI dependency for role-based endpoint guards
  - [ ] Validate role on every protected endpoint

### SEC-003: API Key Exposure Pattern
- **Risk:** Frontend code has Gemini API key placeholder — invites client-side secrets
- **Impact:** API key theft, billing abuse
- **Fix:**
  - [ ] Remove all API key references from frontend code
  - [ ] Create backend proxy for all external API calls
  - [ ] Use server-side environment variables only
  - [ ] Audit git history for previously committed secrets

### SEC-004: No Rate Limiting
- **Risk:** Endpoints vulnerable to brute force and DoS
- **Impact:** Service degradation, excessive compute costs
- **Fix:**
  - [ ] Add SlowAPI rate limiter to FastAPI
  - [ ] Configure: 100 requests/minute for predictions, 10 requests/minute for auth
  - [ ] Add CAPTCHA for account creation
  - [ ] Consider cloud WAF (Cloudflare, AWS WAF)

---

## High-Priority Fixes

### SEC-005: HTTPS / TLS
- [ ] Add nginx reverse proxy with TLS termination
- [ ] Configure HSTS headers
- [ ] Redirect HTTP → HTTPS
- [ ] Use managed certificates (Let's Encrypt / Cloud provider)

### SEC-006: Dependency Vulnerability Scan
- [ ] Run `pip audit` on Python dependencies
- [ ] Run `npm audit` on frontend dependencies
- [ ] Set up Dependabot or Snyk for automated scanning
- [ ] Pin all dependency versions (partially done)

### SEC-007: Input Sanitization
- [ ] Backend Pydantic validation is good ✅
- [ ] Add frontend input sanitization for marketplace text fields
- [ ] Sanitize AgriBot chat inputs before sending to LLM
- [ ] Prevent XSS in marketplace product descriptions

### SEC-008: Logging & Audit Trail
- [ ] Add structured access logs (who, what, when, from where)
- [ ] Log all prediction requests (for model monitoring and abuse detection)
- [ ] Log all admin actions
- [ ] Ship logs to centralized monitoring (ELK, CloudWatch)
- [ ] Set up alerting for anomalous patterns

---

## Data Privacy & Compliance

### Bangladesh Digital Security Act (DSA) 2018
- [ ] Review data handling against DSA requirements
- [ ] Ensure no personal farm data is exposed without consent
- [ ] Add data processing disclosure to terms of service

### Data Handling Checklist
- [ ] Define what constitutes PII in the agriculture context (farmer name, location, phone, land area)
- [ ] Implement data minimization — collect only what's needed
- [ ] Add data retention policy
- [ ] Create data deletion workflow (right to erasure)
- [ ] Encrypt PII at rest when database is added
- [ ] Add privacy policy page to the application

### Model & Data Ethics
- [ ] Add model cards for each crop model documenting biases and limitations
- [ ] Include uncertainty disclaimers on all predictions (partially done ✅)
- [ ] Never present predictions as official government forecasts (documented ✅)
- [ ] Document that climate data has known gaps (station sharing, interpolation)

---

## Security Hardening Checklist

### Pre-Production
- [ ] Enable CORS only for production domains
- [ ] Remove `/docs` and `/redoc` in production or restrict to admin
- [ ] Add security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- [ ] Configure Docker containers to run as non-root
- [ ] Remove development debug modes
- [ ] Add health check authentication or IP whitelisting

### Post-Production
- [ ] Schedule quarterly dependency audits
- [ ] Conduct penetration testing before launch
- [ ] Set up intrusion detection monitoring
- [ ] Create incident response playbook
- [ ] Establish responsible disclosure policy

---

*Last updated: 2026-11-20*
