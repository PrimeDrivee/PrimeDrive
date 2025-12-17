#!/usr/bin/env bash
# Run OWASP ZAP locally (baseline or full).
# Usage: ./scripts/run-zap-local.sh [baseline|full] [auth_header]
# Defaults: target_url=https://host.docker.internal:8443, scan_type=baseline, no auth header.

set -euo pipefail

TARGET_URL=${TARGET_URL:-https://host.docker.internal:8443}
SCAN_TYPE=${1:-baseline}
AUTH_HEADER=${2:-}

# Initialize arrays
AUTH_OPTS=()
SCAN_SCRIPT=()

if [[ "${SCAN_TYPE}" != "baseline" && "${SCAN_TYPE}" != "full" ]]; then
  echo "Scan type must be 'baseline' or 'full'" >&2
  exit 1
fi

IMAGE="ghcr.io/zaproxy/zaproxy:stable"
CMD=(docker run --rm -v "$PWD:/zap/wrk:rw" -t "$IMAGE")

# Ensure image is available (pull once if missing)
if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  echo "Pulling image $IMAGE ..."
  docker pull "$IMAGE"
fi

if [[ -n "${AUTH_HEADER}" ]]; then
  AUTH_OPTS=( -z "-config replacer.full_list(0).description=auth-header -config replacer.full_list(0).enabled=true -config replacer.full_list(0).matchtype=REQ_HEADER -config replacer.full_list(0).matchstr=Authorization -config replacer.full_list(0).replacement=${AUTH_HEADER}" )
fi

if [[ "${SCAN_TYPE}" == "full" ]]; then
  SCAN_SCRIPT=(zap-full-scan.py -t "${TARGET_URL}" -m 3 -d -r zap-report.html -x zap-report.xml -J zap-report.json)
else
  SCAN_SCRIPT=(zap-baseline.py -t "${TARGET_URL}" -m 3 -d -r zap-report.html -x zap-report.xml -J zap-report.json)
fi

echo "Running ZAP ${SCAN_TYPE} scan against ${TARGET_URL}..."
if [[ ${#AUTH_OPTS[@]} -gt 0 ]]; then
  "${CMD[@]}" "${SCAN_SCRIPT[@]}" "${AUTH_OPTS[@]}"
else
  "${CMD[@]}" "${SCAN_SCRIPT[@]}"
fi

echo "Reports written to:"
echo "  $(pwd)/zap-report.html"
echo "  $(pwd)/zap-report.xml"
echo "  $(pwd)/zap-report.json"
