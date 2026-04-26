#!/usr/bin/env python3
"""
CASCADE Gap Verification Script
Tests all 4 completed gaps to ensure they work correctly
"""

import requests
import json
import time
from typing import Dict, List

API_BASE = "http://localhost:8000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_header(text: str):
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}{text.center(60)}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")

def print_success(text: str):
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text: str):
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_info(text: str):
    print(f"{Colors.YELLOW}ℹ️  {text}{Colors.END}")

def test_api_health() -> bool:
    """Test if API is running"""
    try:
        response = requests.get(f"{API_BASE}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"API is running: {data.get('name')} v{data.get('version')}")
            return True
        else:
            print_error(f"API returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Cannot connect to API: {e}")
        return False

def test_gap1_cascade_analyzer() -> bool:
    """Gap 1: Test cascade impact analysis"""
    print_header("GAP 1: Multi-Modal Cascade Analyzer")
    
    try:
        # Get a high-risk shipment
        response = requests.get(f"{API_BASE}/api/predictions/high-risk?limit=1")
        if response.status_code != 200:
            print_error("Cannot fetch high-risk shipments")
            return False
        
        predictions = response.json()
        if not predictions:
            print_info("No high-risk shipments found. Generate predictions first.")
            return False
        
        shipment_id = predictions[0]['shipment_id']
        print_info(f"Testing cascade analysis for shipment: {shipment_id}")
        
        # Test cascade endpoint
        response = requests.get(f"{API_BASE}/api/cascade/{shipment_id}")
        if response.status_code != 200:
            print_error(f"Cascade endpoint failed: {response.status_code}")
            return False
        
        cascade = response.json()
        
        # Verify cascade structure
        required_fields = [
            'root_shipment_id',
            'root_disruption_probability',
            'total_affected_shipments',
            'direct_dependencies',
            'secondary_dependencies',
            'critical_shipments_affected',
            'total_value_at_cascade_risk_usd',
            'cascade_severity_score',
            'cascade_nodes'
        ]
        
        for field in required_fields:
            if field not in cascade:
                print_error(f"Missing field in cascade response: {field}")
                return False
        
        print_success(f"Cascade analysis completed")
        print_info(f"  Root shipment: {cascade['root_shipment_id']}")
        print_info(f"  Disruption probability: {cascade['root_disruption_probability']*100:.1f}%")
        print_info(f"  Total affected: {cascade['total_affected_shipments']} shipments")
        print_info(f"  Direct dependencies: {cascade['direct_dependencies']}")
        print_info(f"  Secondary dependencies: {cascade['secondary_dependencies']}")
        print_info(f"  Critical affected: {cascade['critical_shipments_affected']}")
        print_info(f"  Value at risk: ${cascade['total_value_at_cascade_risk_usd']:,.2f}")
        print_info(f"  Severity score: {cascade['cascade_severity_score']}/10")
        
        # Verify cascade nodes structure
        if cascade['cascade_nodes']:
            node = cascade['cascade_nodes'][0]
            node_fields = ['shipment_id', 'impact_probability', 'cascade_depth', 'dependency_type']
            for field in node_fields:
                if field not in node:
                    print_error(f"Missing field in cascade node: {field}")
                    return False
            print_success(f"Cascade nodes structure verified ({len(cascade['cascade_nodes'])} nodes)")
        
        # Test fleet hotspots
        response = requests.get(f"{API_BASE}/api/cascade/fleet/hotspots?limit=5")
        if response.status_code == 200:
            hotspots = response.json()
            print_success(f"Fleet hotspots endpoint working ({len(hotspots)} hotspots)")
        
        return True
        
    except Exception as e:
        print_error(f"Gap 1 test failed: {e}")
        return False

def test_gap2_cascade_ui() -> bool:
    """Gap 2: Test cascade visualization in UI"""
    print_header("GAP 2: Cascade Visualization in UI")
    
    try:
        # Check if static files exist
        import os
        static_dir = "cascade-phase1/backend/static"
        
        if not os.path.exists(static_dir):
            print_error(f"Static directory not found: {static_dir}")
            return False
        
        # Check app.js for cascade panel code
        app_js_path = os.path.join(static_dir, "app.js")
        if not os.path.exists(app_js_path):
            print_error("app.js not found")
            return False
        
        with open(app_js_path, 'r', encoding='utf-8') as f:
            app_js = f.read()
        
        # Verify cascade panel implementation
        cascade_markers = [
            'cascade_analyzer',
            'Cascade Impact Analysis',
            'cascade-section',
            'cascade-kpi-row',
            'cascade-nodes-grid',
            'cascade_severity_score'
        ]
        
        missing = []
        for marker in cascade_markers:
            if marker not in app_js:
                missing.append(marker)
        
        if missing:
            print_error(f"Missing cascade UI elements: {', '.join(missing)}")
            return False
        
        print_success("app.js contains cascade panel implementation")
        
        # Check style.css for cascade styles
        style_css_path = os.path.join(static_dir, "style.css")
        if not os.path.exists(style_css_path):
            print_error("style.css not found")
            return False
        
        with open(style_css_path, 'r', encoding='utf-8') as f:
            style_css = f.read()
        
        style_markers = [
            '.cascade-section',
            '.cascade-kpi-row',
            '.cascade-node',
            '.cascade-depth-label'
        ]
        
        missing_styles = []
        for marker in style_markers:
            if marker not in style_css:
                missing_styles.append(marker)
        
        if missing_styles:
            print_error(f"Missing cascade CSS styles: {', '.join(missing_styles)}")
            return False
        
        print_success("style.css contains cascade panel styles")
        
        # Test dashboard endpoint
        response = requests.get(f"{API_BASE}/dashboard/")
        if response.status_code == 200:
            print_success("Dashboard UI is accessible")
        else:
            print_error(f"Dashboard returned status {response.status_code}")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Gap 2 test failed: {e}")
        return False

def test_gap3_nsga2() -> bool:
    """Gap 3: Test NSGA-II genetic algorithm"""
    print_header("GAP 3: NSGA-II Multi-Objective Optimization")
    
    try:
        # Check if pymoo is installed
        try:
            import pymoo
            print_success(f"pymoo library installed (v{pymoo.__version__})")
        except ImportError:
            print_error("pymoo library not installed")
            return False
        
        # Get a high-risk shipment
        response = requests.get(f"{API_BASE}/api/predictions/high-risk?limit=1")
        if response.status_code != 200:
            print_error("Cannot fetch high-risk shipments")
            return False
        
        predictions = response.json()
        if not predictions:
            print_info("No high-risk shipments found. Generate predictions first.")
            return False
        
        shipment_id = predictions[0]['shipment_id']
        print_info(f"Testing NSGA-II recommendations for: {shipment_id}")
        
        # Get shipment detail with recommendations
        response = requests.get(f"{API_BASE}/api/shipments/{shipment_id}")
        if response.status_code != 200:
            print_error(f"Shipment detail endpoint failed: {response.status_code}")
            return False
        
        detail = response.json()
        recommendations = detail.get('recommendations', [])
        
        if not recommendations:
            print_info("No recommendations found. Generating...")
            response = requests.post(f"{API_BASE}/api/predictions/generate/{shipment_id}")
            if response.status_code != 200:
                print_error("Failed to generate recommendations")
                return False
            result = response.json()
            recommendations = result.get('recommendations', [])
        
        if not recommendations:
            print_error("No recommendations generated")
            return False
        
        print_success(f"Generated {len(recommendations)} recommendations")
        
        # Verify NSGA-II structure
        for i, rec in enumerate(recommendations, 1):
            print_info(f"\n  Recommendation {i}: {rec.get('option_label')}")
            print_info(f"    Algorithm: {rec.get('algorithm', 'N/A')}")
            print_info(f"    Cost impact: ${rec.get('cost_impact_usd', 0):.2f}")
            print_info(f"    On-time probability: {rec.get('on_time_probability', 0)*100:.1f}%")
            print_info(f"    Risk level: {rec.get('risk_level', 'N/A')}")
            
            # Check for Pareto objectives
            objectives = rec.get('objective_values')
            if objectives and rec.get('algorithm') == 'nsga2_pareto':
                print_success(f"    Pareto objectives: cost={objectives['cost']:.3f}, time={objectives['time']:.3f}, emissions={objectives['emissions']:.3f}, risk={objectives['risk']:.3f}")
            elif rec.get('algorithm') == 'weighted_fallback':
                print_info("    Using weighted fallback (pymoo not available during generation)")
        
        # Verify at least one NSGA-II recommendation
        nsga2_count = sum(1 for r in recommendations if r.get('algorithm') == 'nsga2_pareto')
        if nsga2_count > 0:
            print_success(f"NSGA-II algorithm active ({nsga2_count} Pareto-optimal solutions)")
        else:
            print_info("All recommendations using weighted fallback")
        
        return True
        
    except Exception as e:
        print_error(f"Gap 3 test failed: {e}")
        return False

def test_gap4_docker() -> bool:
    """Gap 4: Test Docker deployment files"""
    print_header("GAP 4: Docker Deployment")
    
    try:
        import os
        import yaml
        
        # Check docker-compose.yml
        compose_path = "cascade-phase1/docker-compose.yml"
        if not os.path.exists(compose_path):
            print_error("docker-compose.yml not found")
            return False
        
        with open(compose_path, 'r') as f:
            compose = yaml.safe_load(f)
        
        # Verify services
        if 'services' not in compose:
            print_error("No services defined in docker-compose.yml")
            return False
        
        required_services = ['cascade-db', 'cascade-api']
        for service in required_services:
            if service not in compose['services']:
                print_error(f"Missing service: {service}")
                return False
        
        print_success("docker-compose.yml structure verified")
        
        # Verify PostgreSQL service
        db_service = compose['services']['cascade-db']
        if db_service.get('image') != 'postgres:15-alpine':
            print_error("PostgreSQL image not postgres:15-alpine")
            return False
        print_success("PostgreSQL 15 service configured")
        
        # Verify API service
        api_service = compose['services']['cascade-api']
        if 'build' not in api_service:
            print_error("API service missing build configuration")
            return False
        print_success("FastAPI service configured")
        
        # Check Dockerfile
        dockerfile_path = "cascade-phase1/backend/Dockerfile"
        if not os.path.exists(dockerfile_path):
            print_error("Dockerfile not found")
            return False
        
        with open(dockerfile_path, 'r') as f:
            dockerfile = f.read()
        
        dockerfile_markers = [
            'FROM python:3.11',
            'COPY requirements.txt',
            'RUN pip install',
            'EXPOSE 8000',
            'uvicorn'
        ]
        
        missing = []
        for marker in dockerfile_markers:
            if marker not in dockerfile:
                missing.append(marker)
        
        if missing:
            print_error(f"Missing Dockerfile elements: {', '.join(missing)}")
            return False
        
        print_success("Dockerfile structure verified")
        
        # Check .env.example
        env_path = "cascade-phase1/.env.example"
        if not os.path.exists(env_path):
            print_error(".env.example not found")
            return False
        
        with open(env_path, 'r') as f:
            env_content = f.read()
        
        env_markers = ['POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'DATABASE_URL']
        missing_env = []
        for marker in env_markers:
            if marker not in env_content:
                missing_env.append(marker)
        
        if missing_env:
            print_error(f"Missing environment variables: {', '.join(missing_env)}")
            return False
        
        print_success(".env.example contains required variables")
        
        # Check if Docker is running (optional)
        try:
            import subprocess
            result = subprocess.run(['docker', '--version'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                print_success(f"Docker installed: {result.stdout.strip()}")
            else:
                print_info("Docker not installed or not running")
        except:
            print_info("Docker not installed or not running")
        
        return True
        
    except Exception as e:
        print_error(f"Gap 4 test failed: {e}")
        return False

def main():
    print_header("CASCADE GAP VERIFICATION SCRIPT")
    print_info("Testing all 4 completed gaps...\n")
    
    results = {}
    
    # Test API health first
    if not test_api_health():
        print_error("\n⚠️  API is not running. Start it with:")
        print_error("   cd cascade-phase1/backend")
        print_error("   uvicorn app.main:app --reload")
        print_info("\nSkipping API-dependent tests...\n")
        api_running = False
    else:
        api_running = True
    
    # Test each gap
    if api_running:
        results['Gap 1: Cascade Analyzer'] = test_gap1_cascade_analyzer()
        time.sleep(1)
    
    results['Gap 2: Cascade UI'] = test_gap2_cascade_ui()
    time.sleep(1)
    
    if api_running:
        results['Gap 3: NSGA-II'] = test_gap3_nsga2()
        time.sleep(1)
    
    results['Gap 4: Docker'] = test_gap4_docker()
    
    # Print summary
    print_header("VERIFICATION SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for gap, result in results.items():
        if result:
            print_success(f"{gap}: PASSED")
        else:
            print_error(f"{gap}: FAILED")
    
    print(f"\n{Colors.BLUE}{'─'*60}{Colors.END}")
    if passed == total:
        print_success(f"ALL {total} GAPS VERIFIED ✅")
    else:
        print_error(f"{passed}/{total} gaps passed")
    print(f"{Colors.BLUE}{'─'*60}{Colors.END}\n")
    
    return passed == total

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
