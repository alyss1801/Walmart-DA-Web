# Run this script to start the Walmart Analytics Dashboard
# Usage: python run_dashboard.py

import subprocess
import sys
from pathlib import Path

def main():
    """Launch the Streamlit dashboard."""
    dashboard_dir = Path(__file__).parent
    home_file = dashboard_dir / "Home.py"
    
    if not home_file.exists():
        print("❌ Error: Home.py not found!")
        print(f"Expected location: {home_file}")
        sys.exit(1)
    
    print("🚀 Starting Walmart Analytics Dashboard...")
    print("📊 The dashboard will open in your default browser")
    print("🛑 Press Ctrl+C to stop the server\n")
    
    try:
        subprocess.run([
            "streamlit", "run", str(home_file),
            "--server.headless", "false"
        ])
    except KeyboardInterrupt:
        print("\n\n✅ Dashboard stopped successfully!")
    except Exception as e:
        print(f"❌ Error starting dashboard: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
