import Papa from "papaparse";

export interface SchemaColumn {
  name: string;
  type: string;
  sample: string;
}

export interface ParsedData {
  columns: SchemaColumn[];
  rows: Record<string, string | number>[];
  rowCount: number;
  schemaText: string;
  sampleText: string;
}

function inferType(values: string[]): string {
  const nonEmpty = values.filter((v) => v !== "" && v !== null && v !== undefined);
  if (nonEmpty.length === 0) return "TEXT";

  const allNumbers = nonEmpty.every((v) => !isNaN(Number(v)) && v.trim() !== "");
  if (allNumbers) {
    const hasDecimal = nonEmpty.some((v) => v.includes("."));
    return hasDecimal ? "REAL" : "INTEGER";
  }

  const datePattern = /^\d{4}[-/]\d{2}[-/]\d{2}/;
  const allDates = nonEmpty.every((v) => datePattern.test(v));
  if (allDates) return "DATE";

  const boolPattern = /^(true|false|yes|no|0|1)$/i;
  const allBools = nonEmpty.every((v) => boolPattern.test(v));
  if (allBools) return "BOOLEAN";

  return "TEXT";
}

export function parseCSVData(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data as Record<string, string>[];
        if (!rows.length) {
          reject(new Error("CSV file is empty or has no valid rows."));
          return;
        }

        const headers = Object.keys(rows[0]);
        const sampleForTyping = rows.slice(0, 100);

        const columns: SchemaColumn[] = headers.map((name) => {
          const values = sampleForTyping.map((r) => r[name] || "");
          return {
            name,
            type: inferType(values),
            sample: values[0] || "",
          };
        });

        // Cast numeric columns for the full dataset
        const typedRows = rows.map((row) => {
          const typed: Record<string, string | number> = {};
          for (const col of columns) {
            const val = row[col.name];
            if (col.type === "INTEGER" || col.type === "REAL") {
              typed[col.name] = val === "" ? 0 : Number(val);
            } else {
              typed[col.name] = val || "";
            }
          }
          return typed;
        });

        const schemaText = columns
          .map((c) => `  ${c.name} (${c.type})`)
          .join("\n");

        const sampleRows = typedRows.slice(0, 5);
        const sampleText = JSON.stringify(sampleRows, null, 2);

        resolve({
          columns,
          rows: typedRows,
          rowCount: typedRows.length,
          schemaText: `Table: data\nColumns:\n${schemaText}\nTotal rows: ${typedRows.length}`,
          sampleText,
        });
      },
      error: (err) => reject(err),
    });
  });
}

// Simple SQL-like engine for in-browser query execution
// Supports: SELECT, WHERE, GROUP BY, ORDER BY, LIMIT, aggregate functions
export function executeSQL(
  sql: string,
  rows: Record<string, string | number>[]
): Record<string, string | number>[] {
  try {
    // Normalize the SQL
    const normalized = sql.trim().replace(/;$/, "");

    // Parse basic SQL structure
    const selectMatch = normalized.match(
      /SELECT\s+([\s\S]+?)\s+FROM\s+data(?:\s+([\s\S]*))?$/i
    );
    if (!selectMatch) throw new Error("Only SELECT FROM data queries are supported.");

    const selectClause = selectMatch[1].trim();
    const restClause = (selectMatch[2] || "").trim();

    // Parse WHERE
    const whereMatch = restClause.match(
      /WHERE\s+([\s\S]+?)(?=\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|\s*$)/i
    );
    // Parse GROUP BY
    const groupMatch = restClause.match(
      /GROUP\s+BY\s+([\s\S]+?)(?=\s+HAVING|\s+ORDER\s+BY|\s+LIMIT|\s*$)/i
    );
    // Parse HAVING
    const havingMatch = restClause.match(
      /HAVING\s+([\s\S]+?)(?=\s+ORDER\s+BY|\s+LIMIT|\s*$)/i
    );
    // Parse ORDER BY
    const orderMatch = restClause.match(
      /ORDER\s+BY\s+([\s\S]+?)(?=\s+LIMIT|\s*$)/i
    );
    // Parse LIMIT
    const limitMatch = restClause.match(/LIMIT\s+(\d+)/i);

    let result = [...rows];

    // Apply WHERE
    if (whereMatch) {
      result = applyWhere(result, whereMatch[1].trim());
    }

    // Parse SELECT fields
    const fields = parseSelectFields(selectClause);

    // Apply GROUP BY + aggregates
    if (groupMatch) {
      const groupCols = groupMatch[1].split(",").map((s) => s.trim());
      result = applyGroupBy(result, groupCols, fields);
    } else if (fields.some((f) => f.aggregate)) {
      // Aggregate without GROUP BY = single result
      result = applyGroupBy(result, [], fields);
    } else {
      // Simple select
      result = result.map((row) => {
        const newRow: Record<string, string | number> = {};
        for (const f of fields) {
          if (f.expression === "*") {
            Object.assign(newRow, row);
          } else {
            newRow[f.alias] = row[f.expression] ?? "";
          }
        }
        return newRow;
      });
    }

    // Apply HAVING
    if (havingMatch) {
      result = applyWhere(result, havingMatch[1].trim());
    }

    // Apply ORDER BY
    if (orderMatch) {
      const orderParts = orderMatch[1].split(",").map((s) => s.trim());
      result = applyOrderBy(result, orderParts);
    }

    // Apply LIMIT
    if (limitMatch) {
      result = result.slice(0, parseInt(limitMatch[1]));
    }

    return result;
  } catch (e) {
    console.error("SQL execution error:", e);
    throw new Error(`SQL execution failed: ${(e as Error).message}`);
  }
}

interface SelectField {
  expression: string;
  alias: string;
  aggregate: string | null;
  aggColumn: string;
}

function parseSelectFields(selectClause: string): SelectField[] {
  // Split by comma, respecting parentheses
  const fields: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of selectClause) {
    if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (char === "," && depth === 0) {
      fields.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) fields.push(current.trim());

  return fields.map((field) => {
    const aliasMatch = field.match(/^([\s\S]+?)\s+AS\s+["`]?(\w+)["`]?\s*$/i);
    const expression = aliasMatch ? aliasMatch[1].trim() : field;
    const alias = aliasMatch ? aliasMatch[2] : field;

    // Check for aggregate functions
    const aggMatch = expression.match(
      /^(COUNT|SUM|AVG|MIN|MAX|ROUND)\s*\(\s*([\s\S]*?)\s*\)$/i
    );
    if (aggMatch) {
      // Handle nested: ROUND(AVG(col), 2)
      const innerAggMatch = aggMatch[2].match(
        /^(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*([\s\S]*?)\s*\)/i
      );
      if (aggMatch[1].toUpperCase() === "ROUND" && innerAggMatch) {
        return {
          expression,
          alias: aliasMatch ? aliasMatch[2] : `${innerAggMatch[1].toLowerCase()}_${innerAggMatch[2]}`,
          aggregate: innerAggMatch[1].toUpperCase(),
          aggColumn: innerAggMatch[2].trim(),
        };
      }
      return {
        expression,
        alias: aliasMatch ? aliasMatch[2] : `${aggMatch[1].toLowerCase()}_${aggMatch[2]}`,
        aggregate: aggMatch[1].toUpperCase(),
        aggColumn: aggMatch[2].trim(),
      };
    }

    return { expression, alias, aggregate: null, aggColumn: "" };
  });
}

function applyWhere(
  rows: Record<string, string | number>[],
  where: string
): Record<string, string | number>[] {
  // Handle simple conditions: col = val, col > val, col LIKE val, col IN (...)
  // Handle AND/OR
  return rows.filter((row) => evaluateCondition(row, where));
}

function evaluateCondition(
  row: Record<string, string | number>,
  condition: string
): boolean {
  // Handle OR
  const orParts = splitLogical(condition, "OR");
  if (orParts.length > 1) {
    return orParts.some((part) => evaluateCondition(row, part));
  }

  // Handle AND
  const andParts = splitLogical(condition, "AND");
  if (andParts.length > 1) {
    return andParts.every((part) => evaluateCondition(row, part));
  }

  const trimmed = condition.trim();

  // Handle IN
  const inMatch = trimmed.match(
    /^["`]?(\w+)["`]?\s+IN\s*\(\s*([\s\S]+?)\s*\)$/i
  );
  if (inMatch) {
    const col = inMatch[1];
    const vals = inMatch[2].split(",").map((v) =>
      v.trim().replace(/^['"]|['"]$/g, "")
    );
    return vals.includes(String(row[col]));
  }

  // Handle LIKE
  const likeMatch = trimmed.match(
    /^["`]?(\w+)["`]?\s+LIKE\s+'([\s\S]+?)'$/i
  );
  if (likeMatch) {
    const col = likeMatch[1];
    const pattern = likeMatch[2]
      .replace(/%/g, ".*")
      .replace(/_/g, ".");
    return new RegExp(`^${pattern}$`, "i").test(String(row[col]));
  }

  // Handle NOT LIKE
  const notLikeMatch = trimmed.match(
    /^["`]?(\w+)["`]?\s+NOT\s+LIKE\s+'([\s\S]+?)'$/i
  );
  if (notLikeMatch) {
    const col = notLikeMatch[1];
    const pattern = notLikeMatch[2]
      .replace(/%/g, ".*")
      .replace(/_/g, ".");
    return !new RegExp(`^${pattern}$`, "i").test(String(row[col]));
  }

  // Handle comparison operators
  const compMatch = trimmed.match(
    /^["`]?(\w+)["`]?\s*(>=|<=|!=|<>|=|>|<)\s*(.+)$/
  );
  if (compMatch) {
    const col = compMatch[1];
    const op = compMatch[2];
    let val: string | number = compMatch[3].trim().replace(/^['"]|['"]$/g, "");

    const rowVal = row[col];
    const numVal = Number(val);
    const numRowVal = Number(rowVal);

    if (!isNaN(numVal) && !isNaN(numRowVal)) {
      switch (op) {
        case "=":
          return numRowVal === numVal;
        case "!=":
        case "<>":
          return numRowVal !== numVal;
        case ">":
          return numRowVal > numVal;
        case "<":
          return numRowVal < numVal;
        case ">=":
          return numRowVal >= numVal;
        case "<=":
          return numRowVal <= numVal;
      }
    } else {
      val = String(val);
      const sRowVal = String(rowVal);
      switch (op) {
        case "=":
          return sRowVal === val;
        case "!=":
        case "<>":
          return sRowVal !== val;
        case ">":
          return sRowVal > val;
        case "<":
          return sRowVal < val;
        case ">=":
          return sRowVal >= val;
        case "<=":
          return sRowVal <= val;
      }
    }
  }

  return true;
}

function splitLogical(condition: string, keyword: string): string[] {
  const regex = new RegExp(`\\s+${keyword}\\s+`, "i");
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  const words = condition.split(/(\s+)/);
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w === "(") depth++;
    else if (w === ")") depth--;

    if (depth === 0 && w.toUpperCase() === keyword && /^\s+$/.test(words[i - 1] || "") && /^\s+$/.test(words[i + 1] || "")) {
      parts.push(current.trim());
      current = "";
      continue;
    }
    current += w;
  }
  if (current.trim()) parts.push(current.trim());

  // Fallback: try simple regex split if above didn't split
  if (parts.length === 1 && regex.test(condition)) {
    return condition.split(regex).map((s) => s.trim());
  }

  return parts;
}

function applyGroupBy(
  rows: Record<string, string | number>[],
  groupCols: string[],
  fields: SelectField[]
): Record<string, string | number>[] {
  // Build groups
  const groups = new Map<string, Record<string, string | number>[]>();

  for (const row of rows) {
    const key = groupCols.map((c) => String(row[c])).join("|||");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  const result: Record<string, string | number>[] = [];

  for (const [, groupRows] of groups) {
    const newRow: Record<string, string | number> = {};

    // Set group columns
    for (const col of groupCols) {
      newRow[col] = groupRows[0][col];
    }

    // Compute aggregates
    for (const field of fields) {
      if (field.aggregate) {
        const values = groupRows
          .map((r) => {
            if (field.aggColumn === "*") return 1;
            return Number(r[field.aggColumn]) || 0;
          });

        switch (field.aggregate) {
          case "COUNT":
            if (field.aggColumn === "*") {
              newRow[field.alias] = groupRows.length;
            } else {
              newRow[field.alias] = values.filter((v) => v !== 0).length;
            }
            break;
          case "SUM":
            newRow[field.alias] = Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
            break;
          case "AVG":
            newRow[field.alias] =
              Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
            break;
          case "MIN":
            newRow[field.alias] = Math.min(...values);
            break;
          case "MAX":
            newRow[field.alias] = Math.max(...values);
            break;
        }
      } else if (groupCols.includes(field.expression)) {
        newRow[field.alias] = groupRows[0][field.expression];
      }
    }

    result.push(newRow);
  }

  return result;
}

function applyOrderBy(
  rows: Record<string, string | number>[],
  orderParts: string[]
): Record<string, string | number>[] {
  return [...rows].sort((a, b) => {
    for (const part of orderParts) {
      const match = part.match(/^["`]?(\w+)["`]?\s*(ASC|DESC)?$/i);
      if (!match) continue;
      const col = match[1];
      const desc = match[2]?.toUpperCase() === "DESC";

      const aVal = a[col] ?? "";
      const bVal = b[col] ?? "";
      const aNum = Number(aVal);
      const bNum = Number(bVal);

      let cmp: number;
      if (!isNaN(aNum) && !isNaN(bNum)) {
        cmp = aNum - bNum;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }

      if (cmp !== 0) return desc ? -cmp : cmp;
    }
    return 0;
  });
}
