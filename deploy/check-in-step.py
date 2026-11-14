#!/usr/bin/env python3
"""Confirm deploy/compose.yaml still matches production.

Production's file is OMV-Docker-Rebuild compose/proxy-security/compose.yaml (private repo). Pass its path:
    python3 deploy/check-in-step.py /path/to/OMV-Docker-Rebuild/compose/proxy-security/compose.yaml
Compares the three fourhorsemen-* services and their three configs. Exit 0 = same, 1 = different.
Needs PyYAML.
"""
import pathlib
import sys

import yaml

SERVICES = ("fourhorsemen-web", "fourhorsemen-contact", "fourhorsemen-sync")
CONFIGS = ("fourhorsemen_nginx", "fourhorsemen_sync", "fourhorsemen_contact")


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    here = yaml.safe_load((pathlib.Path(__file__).parent / "compose.yaml").read_text())
    prod = yaml.safe_load(pathlib.Path(sys.argv[1]).read_text())
    bad = []
    for s in SERVICES:
        if here["services"].get(s) != prod["services"].get(s):
            bad.append(f"service {s}")
    for c in CONFIGS:
        if here["configs"].get(c) != prod["configs"].get(c):
            bad.append(f"config {c}")
    extra = set(here["services"]) - set(SERVICES)
    if extra:
        bad.append("unexpected services here: " + ", ".join(sorted(extra)))
    if bad:
        print("DIFFERENT: " + "; ".join(bad))
        print("Copy the blocks from production into deploy/compose.yaml (production is the source of truth).")
        return 1
    print("IN STEP: deploy/compose.yaml matches production for all three services and configs.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
