from __future__ import annotations

import json
from decimal import Decimal, InvalidOperation
from pathlib import Path

from openpyxl import load_workbook

SOURCE = Path("assets/data/book-progress.xlsx")
TARGET = Path("assets/data/book-progress.json")
EXPECTED_HEADERS = ["Книга", "Этап", "Статус", "Вес"]
ALLOWED_STATUSES = {"in_progress", "done"}


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Не найден исходный файл: {SOURCE}")

    workbook = load_workbook(SOURCE, read_only=True, data_only=True)
    sheet = workbook.active
    headers = [sheet.cell(1, column).value for column in range(1, 5)]
    if headers != EXPECTED_HEADERS:
        raise ValueError(f"Ожидались столбцы {EXPECTED_HEADERS!r}, получены {headers!r}")

    items = []
    totals: dict[str, Decimal] = {}
    seen: set[tuple[str, str]] = set()

    for row_number, values in enumerate(
        sheet.iter_rows(min_row=2, max_col=4, values_only=True), start=2
    ):
        if not any(value is not None for value in values):
            continue

        book, stage, status, raw_weight = values
        if not all(isinstance(value, str) and value.strip() for value in (book, stage, status)):
            raise ValueError(f"Строка {row_number}: книга, этап и статус обязательны")
        book, stage, status = book.strip(), stage.strip(), status.strip()

        if status not in ALLOWED_STATUSES:
            raise ValueError(
                f"Строка {row_number}: недопустимый статус {status!r}; "
                f"разрешены только {sorted(ALLOWED_STATUSES)}"
            )

        try:
            weight = Decimal(str(raw_weight)).quantize(Decimal("0.01"))
        except (InvalidOperation, TypeError):
            raise ValueError(f"Строка {row_number}: вес должен быть числом") from None
        if weight <= 0:
            raise ValueError(f"Строка {row_number}: вес должен быть больше нуля")

        key = (book, stage)
        if key in seen:
            raise ValueError(f"Строка {row_number}: повторяется этап {stage!r} для {book!r}")
        seen.add(key)

        totals[book] = totals.get(book, Decimal("0.00")) + weight
        items.append({
            "book": book,
            "stage": stage,
            "status": status,
            "weight": float(weight),
        })

    workbook.close()

    if not items:
        raise ValueError("Таблица не содержит этапов")

    for book, total in totals.items():
        if total != Decimal("100.00"):
            raise ValueError(
                f"Сумма весов для {book!r} должна быть 100.00%, сейчас {total:.2f}%"
            )

    TARGET.write_text(
        json.dumps({"items": items}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Создан {TARGET}: {len(items)} этапов, {len(totals)} независимые шкалы")
    for book, total in totals.items():
        print(f"- {book}: сумма весов {total:.2f}%")


if __name__ == "__main__":
    main()
