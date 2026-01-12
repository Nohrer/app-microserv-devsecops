import json
import os
import sys

# Usage: trivy_to_sonar.py <trivy_fs_json> <output_sonar_json> <service_dir>
# Converts Trivy FS scan JSON into SonarQube Generic Issue format.

SEVERITY_MAP = {
    "CRITICAL": "BLOCKER",
    "HIGH": "CRITICAL",
    "MEDIUM": "MAJOR",
    "LOW": "MINOR",
    "UNKNOWN": "INFO",
}

def to_sonar_issue(vuln, target, service_dir):
    severity = SEVERITY_MAP.get(vuln.get("Severity"), "INFO")
    rule_id = vuln.get("VulnerabilityID") or vuln.get("ID") or "TRIVY-UNKNOWN"
    pkg = vuln.get("PkgName") or ""
    installed = vuln.get("InstalledVersion") or ""
    title = vuln.get("Title") or vuln.get("Description") or rule_id
    message = f"{rule_id}: {title} ({pkg} {installed})".strip()

    file_path = target
    # Trivy FS scan uses mount path like /scan/...; map back to workspace service directory
    if file_path.startswith("/scan/"):
        file_path = os.path.join(service_dir, file_path[len("/scan/"):])
    elif file_path == "/scan":
        file_path = service_dir

    issue = {
        "engineId": "trivy",
        "ruleId": rule_id,
        "severity": severity,
        "type": "VULNERABILITY",
        "primaryLocation": {
            "message": message,
            "filePath": file_path,
        },
    }
    return issue

def convert(trivy_path, output_path, service_dir):
    with open(trivy_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    issues = []

    results = data.get("Results") or []
    for res in results:
        target = res.get("Target") or service_dir
        vulns = res.get("Vulnerabilities") or []
        for v in vulns:
            try:
                issues.append(to_sonar_issue(v, target, service_dir))
            except Exception:
                # Be resilient: skip malformed entries
                continue

    out = {"issues": issues}
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)

def main():
    if len(sys.argv) < 4:
        print("Usage: trivy_to_sonar.py <trivy_fs_json> <output_sonar_json> <service_dir>")
        sys.exit(2)
    trivy_path, output_path, service_dir = sys.argv[1:4]
    convert(trivy_path, output_path, service_dir)

if __name__ == "__main__":
    main()
