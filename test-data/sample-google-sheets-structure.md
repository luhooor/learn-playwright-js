# Google Sheets Test Data Structure

This document describes the expected structure of your Google Sheets for test data integration.

## Required Sheets

### 1. Users Sheet
**Sheet Name:** `Users`
**Range:** `A1:D10`

| user_type | username | password | description |
|-----------|----------|----------|-------------|
| standard_user | standard_user | secret_sauce | Standard user with full access |
| locked_out_user | locked_out_user | secret_sauce | User that has been locked out |
| problem_user | problem_user | secret_sauce | User with UI problems |
| performance_glitch_user | performance_glitch_user | secret_sauce | User with performance issues |
| visual_user | visual_user | secret_sauce | User for visual testing |


# Google Sheets Test Data Structure (single-sheet)

This project supports a simplified, single-sheet Google Sheets layout for test data to keep things compact and easy to manage.

## Sheet layout

- Sheet name: `TestData` (you can name it anything, but examples below use `TestData`).
- Header row (first row) must contain exactly: `testname` and `testdata` (in any order).

Example rows:

testname | testdata
---|---
SL001 | (user_type:standard_user, username:standard_user, password:secret_sauce)
SL002 | (user_type:standard_user, products:Sauce Labs Backpack|Sauce Labs Bike Light, total:2)
SL008 | (user_type:locked_out_user, error_expected:TRUE, message:Sorry, this user has been locked out.)

### `testdata` value format

- The `testdata` cell is a compact list of key:value pairs.
- Format (recommended): (key:value, key:value)
- Rules & conventions:
	- Pairs are separated by commas `,`.
	- Each pair is `key:value`. Keys should be simple identifiers (letters, numbers, underscores, dashes).
	- Values are strings by default. Special handling:
		- Use `|` inside a value to represent an array/list (e.g., `products:Item A|Item B`). The parser converts this to an array.
		- `TRUE`/`FALSE` (case-insensitive) become booleans.
		- Numeric-looking values are coerced to numbers when possible.
		- If a value contains a comma, escape it with a backslash `\,` or store JSON in that value (see below).
	- For very complex structures, store a JSON object as the value (e.g., `meta:{"a":1}`) and the parser will attempt JSON.parse.

## Setup & sharing (quick)

1. Create a Google Sheet and add a single sheet named `TestData` (or any name you prefer).
2. Add header row: `testname`, `testdata`.
3. Add rows with the compact `testdata` values as shown above.
4. Share the sheet with your Google service account email used by the Sheets API.
5. Place the spreadsheet ID in your environment variables.

## Environment variables (same as before)

The following values are typically required for the Google Sheets service account access (your project may use a different naming convention):

GOOGLE_SHEETS_PRIVATE_KEY_ID
GOOGLE_SHEETS_PRIVATE_KEY (with newlines escaped as `\n` when stored in env)
GOOGLE_SHEETS_CLIENT_EMAIL
GOOGLE_SHEETS_CLIENT_ID
GOOGLE_SHEETS_CLIENT_CERT_URL
GOOGLE_SPREADSHEET_ID

## Usage in tests

Recommended helper method: `getTestData(testName)` — it should:

- read the `TestData` sheet
- find the row where `testname === testName`
- parse the `testdata` column into a JavaScript object and return it

Example usage:

```javascript
const sheetsManager = new GoogleSheetsManager();
const data = await sheetsManager.getTestData('SL002');
console.log(data.user_type); // 'standard_user'
console.log(data.products); // ['Sauce Labs Backpack', 'Sauce Labs Bike Light']
console.log(data.total); // 2 (number)
```

### Suggested parse helper (JavaScript)

Drop this into your `GoogleSheetsManager` or a small util file. It is intentionally small and conservative; adapt it if you need stricter edge-case handling.

```javascript
function parseTestData(str) {
	if (!str) return {};
	let s = String(str).trim();
	// remove outer parentheses if present
	if (s.startsWith('(') && s.endsWith(')')) {
		s = s.slice(1, -1).trim();
	}
	if (!s) return {};

	// split pairs on unescaped commas
	const rawPairs = s.split(/(?<!\\),/).map(p => p.trim()).filter(Boolean);
	const out = {};

	for (const pair of rawPairs) {
		const idx = pair.indexOf(':');
		if (idx === -1) continue; // skip malformed
		const key = pair.slice(0, idx).trim();
		let val = pair.slice(idx + 1).trim();
		// unescape commas
		val = val.replace(/\\,/g, ',');

		// try boolean
		if (/^(true|false)$/i.test(val)) {
			out[key] = /^true$/i.test(val);
			continue;
		}

		// try number
		if (!Number.isNaN(Number(val)) && val !== '') {
			out[key] = Number(val);
			continue;
		}

		// list by pipe
		if (val.includes('|')) {
			out[key] = val.split('|').map(x => x.trim());
			continue;
		}

		// try JSON (objects/arrays)
		if (/^[\[{]/.test(val)) {
			try { out[key] = JSON.parse(val); continue; } catch (e) { /* fall through */ }
		}

		// fallback: string
		out[key] = val;
	}
	return out;
}

// Example: reading a sheet row and returning parsed data
// (Assumes you already retrieved rows from Sheets API into an array)
async function getTestDataFromRows(rows, testName) {
	// rows: array of objects like { testname: 'SL002', testdata: '(...)' }
	const row = rows.find(r => String(r.testname).trim() === String(testName).trim());
	if (!row) return null;
	return parseTestData(row.testdata);
}
```

Notes and caveats:

- The compact key:value style is aimed for readability and easy editing by non-developers.
- If you need arbitrary nested objects, store JSON in the `testdata` value instead of the key:value shorthand.
- If values include commas, escape them `\,` or prefer pipe-delimited lists.

## Migration tips

To migrate from a previous multi-sheet setup, export or copy the fields you need into one `testdata` string per test row. Example:

`(user_type:standard_user, username:standard_user, password:secret_sauce, products:Sauce Labs Backpack|Sauce Labs Bike Light)`

This keeps each test row self-contained and easy to fetch by `testname`.

---

If you'd like, I can also:

 - Add a small helper file in the repo that implements `getTestData(testName)` using your current Sheets client code,
 - Or update your existing `GoogleSheetsManager` to include `getTestData` and unit tests.

Tell me which you'd prefer and I'll implement it next.

