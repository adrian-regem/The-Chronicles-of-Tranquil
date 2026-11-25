from __future__ import annotations

import json
from pathlib import Path

from openpyxl import load_workbook

SOURCE = Path("assets/data/quotes.xlsx")
TARGET = Path("assets/data/quotes.json")
ALLOWED_TAGS = {"Размышления", "Чувства", "Мрак", "Остроумие"}
EXPECTED_COUNT = 134


def main() -> None:
    workbook = load_workbook(SOURCE, read_only=True, data_only=True)
    sheet = workbook.active
    headers = [sheet.cell(1, column).value for column in range(1, 5)]
    if headers != ["ID", "Цитата", "Источник", "Темы"]:
        raise ValueError(f"Unexpected spreadsheet headers: {headers!r}")

    quotes = []
    seen_ids = set()
    for row_number, values in enumerate(
        sheet.iter_rows(min_row=2, max_col=4, values_only=True), start=2
    ):
        if not any(value is not None for value in values):
            continue
        quote_id, quote, source, raw_tags = values
        if not isinstance(quote_id, int):
            raise ValueError(f"Row {row_number}: ID must be an integer")
        if quote_id in seen_ids:
            raise ValueError(f"Row {row_number}: duplicate ID {quote_id}")
        if not all(isinstance(value, str) and value.strip() for value in (quote, source, raw_tags)):
            raise ValueError(f"Row {row_number}: quote, source and themes are required")

        tags = [tag.strip() for tag in raw_tags.split(",") if tag.strip()]
        unknown = set(tags) - ALLOWED_TAGS
        if not tags or unknown:
            raise ValueError(f"Row {row_number}: invalid themes {sorted(unknown)!r}")
        if len(tags) != len(set(tags)):
            raise ValueError(f"Row {row_number}: duplicate themes")

        seen_ids.add(quote_id)
        quotes.append({
            "id": quote_id,
            "quote": quote.strip(),
            "source": source.strip(),
            "tags": tags,
        })

    quotes.sort(key=lambda item: item["id"])
    if len(quotes) != EXPECTED_COUNT:
        raise ValueError(f"Expected {EXPECTED_COUNT} quotes, found {len(quotes)}")
    if [item["id"] for item in quotes] != list(range(1, EXPECTED_COUNT + 1)):
        raise ValueError("Quote IDs must be consecutive from 1 through 134")

    TARGET.write_text(
        json.dumps({"quotes": quotes}, ensure_ascii=False, indent=2) + "\\n",
        encoding="utf-8",
    )
    print(f"Generated {TARGET} with {len(quotes)} quotes")


if __name__ == "__main__":
    main()
