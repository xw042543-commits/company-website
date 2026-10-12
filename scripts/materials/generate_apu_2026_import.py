from __future__ import annotations

import csv
import json
import sys
from pathlib import Path


ENGINEERING_BACHELORS = {
    "电气与电子工程荣誉学士学位",
    "机电一体化荣誉学士学位",
    "机械工程荣誉学士学位",
    "石油工程荣誉学士学位",
    "电脑工程荣誉学士学位",
}
RESEARCH_MASTERS = {
    "工程学研究型硕士学位",
    "管理学研究型硕士学位",
    "计算机学研究型硕士学位",
    "沉浸式技术与电子游戏研究型硕士学位",
}
PREMIUM_MASTERS = {
    "人工智能硕士学位",
    "网络安全硕士学位",
    "数据科学与商业分析硕士学位",
}


def facts(programme: dict[str, object]) -> dict[str, object]:
    level = str(programme["studyLevelCode"])
    name = str(programme["nameZh"])
    duration_months: int | None = None
    tuition: int
    page: int

    if level == "FOUNDATION":
        duration_months = 12
        tuition = 29_200 if name == "大学预科（工程学）" else 28_400
        page = 5
    elif level == "DIPLOMA":
        duration_months = 24
        tuition = 54_200
        page = 5
    elif level == "BACHELOR":
        page = 5
        if name in ENGINEERING_BACHELORS:
            duration_months, tuition = 48, 137_200
        elif name == "建筑学荣誉学士学位":
            duration_months, tuition = 36, 110_400
        else:
            duration_months, tuition = 36, 108_500
    elif level == "MASTER":
        page = 6
        if name in RESEARCH_MASTERS:
            tuition = 32_000
        elif name in PREMIUM_MASTERS:
            tuition = 45_800
        elif name == "学习设计与科技教育学硕士学位":
            tuition = 34_800
        else:
            tuition = 42_000
    elif level == "DOCTOR":
        page = 6
        tuition = 56_800 if "DBA" in name else 50_800
    else:
        raise ValueError(f"Unsupported APU level: {level} / {name}")

    duration_display = f"{duration_months // 12}年" if duration_months else None
    period = f"（{duration_display}）" if duration_display else ""
    return {
        "programme_code": programme["programmeCode"],
        "programme_name_zh": name,
        "study_level_code": level,
        "duration_months": duration_months,
        "duration_display": duration_display,
        "tuition_myr": tuition,
        "tuition_display": f"总学费 RM {tuition:,}{period}，不含6% SST",
        "tuition_fee_period": "TOTAL_PROGRAM",
        "source_filename": "2026亚太科技宣传手册【洋豆角留学】.pdf",
        "source_page": page,
        "confidence": "high",
    }


def sql_literal(value: object) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, int):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: generate_apu_2026_import.py CATALOG_JSON REVIEW_CSV SQL_FILE")
    catalog_path, review_path, sql_path = map(Path, sys.argv[1:])
    catalog = json.loads(catalog_path.read_text(encoding="utf-8-sig"))
    apu = next(item for item in catalog if item["slug"] == "apu")
    rows = [facts(programme) for programme in apu["programmes"]]
    if len(rows) != 71 or len({row["programme_code"] for row in rows}) != 71:
        raise ValueError(f"Expected 71 unique APU programmes, got {len(rows)}")

    review_path.parent.mkdir(parents=True, exist_ok=True)
    with review_path.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(sorted(rows, key=lambda row: (str(row["study_level_code"]), str(row["programme_code"]))))

    values = []
    for row in sorted(rows, key=lambda item: str(item["programme_code"])):
        values.append(
            "    (" + ", ".join(
                sql_literal(row[key])
                for key in (
                    "programme_code", "duration_months", "duration_display", "tuition_myr",
                    "tuition_display", "tuition_fee_period",
                )
            ) + ")"
        )
    sql = f"""-- Verified against the supplied 2026 APU international-student brochure, pages 5-6.
-- Fees exclude the Malaysian government's 6% SST, as stated in the source.
CREATE TEMP TABLE apu_2026_programme_facts (
    programme_code VARCHAR(64) PRIMARY KEY,
    duration_months INTEGER,
    duration_display VARCHAR(100),
    tuition_myr NUMERIC(14, 2) NOT NULL,
    tuition_display VARCHAR(200) NOT NULL,
    tuition_fee_period VARCHAR(24) NOT NULL
) ON COMMIT DROP;

INSERT INTO apu_2026_programme_facts (
    programme_code, duration_months, duration_display, tuition_myr, tuition_display, tuition_fee_period
) VALUES
{',\n'.join(values)};

DO $$
DECLARE
    existing_apu_count INTEGER;
    matched_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO existing_apu_count
    FROM programmes p
    JOIN universities u ON u.id = p.university_id
    WHERE u.slug = 'apu';

    SELECT COUNT(*) INTO matched_count
    FROM programmes p
    JOIN universities u ON u.id = p.university_id
    JOIN apu_2026_programme_facts f ON f.programme_code = p.programme_code
    WHERE u.slug = 'apu';

    IF existing_apu_count > 0 AND matched_count <> 71 THEN
        RAISE EXCEPTION 'Expected 71 APU programme matches, found %', matched_count;
    END IF;
END $$;

UPDATE programmes p
SET duration_months = COALESCE(f.duration_months, p.duration_months),
    duration_display = COALESCE(f.duration_display, p.duration_display),
    tuition_min = f.tuition_myr,
    tuition_max = f.tuition_myr,
    tuition_currency = 'MYR',
    tuition_display = f.tuition_display,
    tuition_fee_period = f.tuition_fee_period,
    source_checked_at = TIMESTAMPTZ '2026-10-12 00:00:00+08:00',
    updated_at = CURRENT_TIMESTAMP
FROM apu_2026_programme_facts f, universities u
WHERE p.programme_code = f.programme_code
  AND p.university_id = u.id
  AND u.slug = 'apu';
"""
    sql_path.parent.mkdir(parents=True, exist_ok=True)
    sql_path.write_text(sql, encoding="utf-8", newline="\n")
    print(json.dumps({"rows": len(rows), "review": str(review_path), "sql": str(sql_path)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
