from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path


FEE_RE = re.compile(r"(?<!\d)(\d{2,3}\s*,\s*\d{3})(?!\d)")
DURATION_RE = re.compile(r"(?:\d+-\d+年|\d+年(?:\d+个月)?|\d+个月|\d+\+\d+)")


def main() -> None:
    if len(sys.argv) < 4:
        raise SystemExit("usage: build_sunway_candidates.py CATALOG OUTPUT_CSV SOURCE_TEXT...")
    catalog = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8-sig"))
    programmes = next(item for item in catalog if item["slug"] == "sunway")["programmes"]
    sources = [(Path(name), Path(name).read_text(encoding="utf-8").splitlines()) for name in sys.argv[3:]]
    rows: list[dict[str, object]] = []

    for programme in programmes:
        name = programme["nameZh"]
        occurrences: list[tuple[Path, int]] = []
        for source, lines in sources:
            occurrences.extend((source, index) for index, line in enumerate(lines) if name in line)
        row: dict[str, object] = {
            "programme_code": programme["programmeCode"],
            "programme_name_zh": name,
            "study_level_code": programme["studyLevelCode"],
            "matched": len(occurrences) == 1,
            "duration_display": "",
            "duration_months": "",
            "tuition_min_myr": "",
            "tuition_max_myr": "",
            "source_filename": "",
            "source_page": "",
            "evidence": "",
            "review_status": "needs_review",
        }
        if len(occurrences) == 1:
            source, index = occurrences[0]
            lines = dict(sources)[source]
            start = max(0, index - 3)
            end = min(len(lines), index + 2)
            evidence_lines = [line.strip() for line in lines[start:end] if line.strip()]
            fee_line = next((line for line in reversed(lines[start:index + 1]) if FEE_RE.search(line)), "")
            fees = [int(value.replace(" ", "").replace(",", "")) for value in FEE_RE.findall(fee_line)]
            duration_match = DURATION_RE.search(fee_line)
            duration = duration_match.group(0) if duration_match else ""
            months = ""
            duration_clean = duration.replace(" ", "")
            match = re.fullmatch(r"(\d+)年(?:(\d+)个月)?", duration_clean)
            if match:
                months = int(match.group(1)) * 12 + int(match.group(2) or 0)
            elif re.fullmatch(r"\d+个月", duration_clean):
                months = int(duration_clean[:-2])
            row.update({
                "duration_display": duration,
                "duration_months": months,
                "tuition_min_myr": min(fees) if fees else "",
                "tuition_max_myr": max(fees) if fees else "",
                "source_filename": source.with_suffix(".pdf").name,
                "source_page": sum(1 for line in lines[:index + 1] if line.startswith("=== PAGE")),
                "evidence": " | ".join(evidence_lines),
                "review_status": "candidate" if fees else "needs_review",
            })
        rows.append(row)

    output = Path(sys.argv[2])
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps({
        "total": len(rows),
        "exact_name_match": sum(bool(row["matched"]) for row in rows),
        "tuition_candidates": sum(bool(row["tuition_min_myr"]) for row in rows),
        "duration_candidates": sum(bool(row["duration_display"]) for row in rows),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
