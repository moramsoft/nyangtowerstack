#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "🧪 Running Meow Stack Tower Automated Test Suite..."
node scripts/test_scenarios.js
