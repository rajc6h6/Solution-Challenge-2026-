# CASCADE — Quick Start Guide

## 🚀 Test All 4 Gaps in 5 Minutes

### Prerequisites
- Python 3.11+ installed
- Docker installed (optional, for Gap 4 testing)

---

## Step 1: Start the Backend (30 seconds)

```bash
cd c:\Users\raj\Hackathons\Skills\cascade-phase1\backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Start the API
uvicorn app.main:app --reload
```

Wait for:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

## Step 2: Generate Data & Train Models (60 seconds)

Open a new terminal:

```bash
cd c:\Users\raj\Hackathons\Skills\cascade-phase1\backend

# Generate synthetic data
curl -X POST http://localhost:8000/api/data/generate-synthetic?n_shipments=500

# Train ML models
curl -X POST http://localhost:8000/api/ml/train

# Generate predictions
curl -X POST http://localhost:8000/api/predictions/batch-generate
```

---

## Step 3: Test Gap 1 — Cascade Analyzer (10 seconds)

```bash
# Get a high-risk shipment ID
curl http://localhost:8000/api/predictions/high-risk?limit=1

# Test cascade analysis (replace SHIP-XXX with actual ID from above)
curl http://localhost:8000/api/cascade/SHIP-001
```

**Expected Output:**
```json
{
  "root_shipment_id": "SHIP-001",
  "root_disruption_probability": 0.873,
  "total_affected_shipments": 12,
  "direct_dependencies": 8,
  "secondary_dependencies": 4,
  "critical_shipments_affected": 3,
  "total_value_at_cascade_risk_usd": 450000.00,
  "cascade_severity_score": 8.7,
  "cascade_nodes": [...]
}
```

✅ **Gap 1 VERIFIED** if you see cascade_nodes with impact_probability and cascade_depth

---

## Step 4: Test Gap 2 — Cascade UI (30 seconds)

1. Open browser: http://localhost:8000/dashboard/

2. Click any red alert card in the "Critical Alerts" panel

3. Modal opens — scroll down to see:
   ```
   ⚡ Cascade Impact Analysis — X Downstream Shipments At Risk
   ```

4. Verify you see:
   - 4 KPI cards (Affected, Critical, Value at Risk, Severity)
   - "⬇ Direct Dependencies (Depth 1)" section with shipment cards
   - "⬇⬇ Secondary Impact (Depth 2)" section (if applicable)
   - Color-coded impact probabilities
   - Critical shipment indicators (🔴)

✅ **Gap 2 VERIFIED** if cascade panel displays with visual node tree

---

## Step 5: Test Gap 3 — NSGA-II (20 seconds)

In the same modal from Step 4, scroll to:
```
🧬 NSGA-II Pareto-Optimal Recommendations
```

Verify each recommendation shows:
- **NSGA-II Pareto** badge (blue) or **Weighted** badge (amber)
- Cost Impact, On-Time Prob, New ETA, CO2 Impact
- Pareto Objectives row: `Cost: X%, Time: X%, Emissions: X%, Risk: X%`

✅ **Gap 3 VERIFIED** if you see "NSGA-II Pareto" badges and objective values

---

## Step 6: Test Gap 4 — Docker (60 seconds)

```bash
cd c:\Users\raj\Hackathons\Skills\cascade-phase1

# Verify files exist
dir docker-compose.yml
dir backend\Dockerfile
dir .env.example

# Start Docker services
docker-compose up -d

# Wait 30 seconds for services to start
timeout /t 30

# Test API through Docker
curl http://localhost:8000/

# Stop services
docker-compose down
```

✅ **Gap 4 VERIFIED** if docker-compose starts both services and API responds

---

## Step 7: Run Automated Verification (30 seconds)

```bash
cd c:\Users\raj\Hackathons\Skills

# Install PyYAML if needed
pip install pyyaml

# Run verification script
python verify_gaps.py
```

**Expected Output:**
```
════════════════════════════════════════════════════════════
              CASCADE GAP VERIFICATION SCRIPT
════════════════════════════════════════════════════════════

✅ API is running: CASCADE v1.0.0

════════════════════════════════════════════════════════════
           GAP 1: Multi-Modal Cascade Analyzer
════════════════════════════════════════════════════════════

✅ Cascade analysis completed
✅ Cascade nodes structure verified (12 nodes)
✅ Fleet hotspots endpoint working (5 hotspots)

════════════════════════════════════════════════════════════
          GAP 2: Cascade Visualization in UI
════════════════════════════════════════════════════════════

✅ app.js contains cascade panel implementation
✅ style.css contains cascade panel styles
✅ Dashboard UI is accessible

════════════════════════════════════════════════════════════
        GAP 3: NSGA-II Multi-Objective Optimization
════════════════════════════════════════════════════════════

✅ pymoo library installed (v0.6.1.1)
✅ Generated 3 recommendations
✅ NSGA-II algorithm active (2 Pareto-optimal solutions)

════════════════════════════════════════════════════════════
                  GAP 4: Docker Deployment
════════════════════════════════════════════════════════════

✅ docker-compose.yml structure verified
✅ PostgreSQL 15 service configured
✅ FastAPI service configured
✅ Dockerfile structure verified
✅ .env.example contains required variables

════════════════════════════════════════════════════════════
                   VERIFICATION SUMMARY
════════════════════════════════════════════════════════════

✅ Gap 1: Cascade Analyzer: PASSED
✅ Gap 2: Cascade UI: PASSED
✅ Gap 3: NSGA-II: PASSED
✅ Gap 4: Docker: PASSED

────────────────────────────────────────────────────────────
✅ ALL 4 GAPS VERIFIED ✅
────────────────────────────────────────────────────────────
```

---

## Troubleshooting

### Issue: "No high-risk shipments found"
**Solution:** Run batch prediction generation:
```bash
curl -X POST http://localhost:8000/api/predictions/batch-generate
```

### Issue: "pymoo not available"
**Solution:** Install pymoo:
```bash
pip install pymoo==0.6.1.1
```

### Issue: "Cascade panel not showing"
**Solution:** 
1. Hard refresh browser (Ctrl+F5)
2. Check browser console for errors
3. Verify API is returning cascade data:
   ```bash
   curl http://localhost:8000/api/cascade/SHIP-001
   ```

### Issue: "Docker services won't start"
**Solution:**
1. Check Docker is running: `docker --version`
2. Check port 5432 is free: `netstat -an | findstr 5432`
3. View logs: `docker-compose logs -f`

---

## Visual Verification Checklist

### Gap 1: Cascade Analyzer ✅
- [ ] API endpoint `/api/cascade/{id}` returns JSON
- [ ] Response includes `cascade_nodes` array
- [ ] Each node has `impact_probability` and `cascade_depth`
- [ ] Severity score is between 0-10

### Gap 2: Cascade UI ✅
- [ ] Dashboard loads at http://localhost:8000/dashboard/
- [ ] Clicking alert opens modal
- [ ] Modal shows "⚡ Cascade Impact Analysis" section
- [ ] 4 KPI cards display (Affected, Critical, Value, Severity)
- [ ] Depth-1 nodes display in grid
- [ ] Depth-2 nodes display (if applicable)
- [ ] Nodes show color-coded impact probabilities
- [ ] Critical shipments have 🔴 indicator

### Gap 3: NSGA-II ✅
- [ ] Recommendations section shows "🧬 NSGA-II Pareto-Optimal"
- [ ] At least one recommendation has "NSGA-II Pareto" badge
- [ ] Pareto objectives row displays 4 values
- [ ] Each recommendation shows cost, time, emissions, risk

### Gap 4: Docker ✅
- [ ] `docker-compose.yml` exists
- [ ] `backend/Dockerfile` exists
- [ ] `.env.example` exists
- [ ] `docker-compose up -d` starts 2 services
- [ ] API accessible at http://localhost:8000
- [ ] `docker-compose down` stops services cleanly

---

## Success Criteria

**ALL 4 GAPS COMPLETE** when:

1. ✅ Cascade API returns dependency graph with Monte Carlo probabilities
2. ✅ UI displays cascade panel with visual node tree
3. ✅ Recommendations show NSGA-II Pareto badges and objectives
4. ✅ Docker Compose starts PostgreSQL + FastAPI services

---

## Next Steps

Once verified, you can:

1. **Demo the system** to stakeholders
2. **Deploy to production** using Docker
3. **Extend with real-time data** (weather APIs, traffic APIs)
4. **Add advanced visualizations** (D3.js cascade graph)

---

## Support

If you encounter issues:

1. Check `GAP_COMPLETION_REPORT.md` for detailed documentation
2. Run `python verify_gaps.py` for automated diagnostics
3. Check API logs for errors
4. Verify all dependencies are installed: `pip list`

---

**Total Time to Verify:** ~5 minutes  
**All Gaps Status:** ✅ COMPLETE  
**System Status:** 🟢 PRODUCTION READY
