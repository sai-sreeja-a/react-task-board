

\# PostgreSQL Performance Analysis



Dataset: 100,000 tasks



Performance measured using PostgreSQL EXPLAIN ANALYZE.



\## Query 1: Task title search



Query:

```sql

SELECT \* FROM tasks

WHERE title ILIKE '%99999%';

```



Before optimization:

\- Scan: Sequential Scan

\- Execution time: 88.750 ms



Optimization:

\- Added GIN trigram index on title.

\- Migration: 003\_optimize\_task\_search.sql



After optimization:

\- Scan: Bitmap Index Scan

\- Index: idx\_tasks\_title\_trgm

\- Execution time: 1.292 ms



\## Query 2: Sort tasks by creation date



Query:

```sql

SELECT \* FROM tasks

ORDER BY created\_at DESC

LIMIT 20;

```



Before optimization:

\- Scan: Parallel Sequential Scan and Sort

\- Execution time: 72.531 ms



Optimization:

\- Added B-tree index on created\_at DESC.

\- Migration: 004\_optimize\_task\_sorting.sql



After optimization:

\- Scan: Index Scan

\- Index: idx\_tasks\_created\_at\_desc

\- Execution time: 0.230 ms



\## Query 3: Filter tasks by project and status



Query:

```sql

SELECT \* FROM tasks

WHERE project\_id = 5 AND status = 'done'

ORDER BY created\_at DESC

LIMIT 20;

```



Before optimization:

\- Scan: Index Scan using creation-date index

\- 97 rows removed by filter

\- Execution time: 1.121 ms



Optimization:

\- Added composite index on project\_id, status, created\_at DESC.

\- Migration: 005\_optimize\_project\_task\_queries.sql



After optimization:

\- Scan: Index Scan

\- Index: idx\_tasks\_project\_status\_created

\- Execution time: 0.254 ms



\## Performance Summary



| Query | Before | After |

|---|---:|---:|

| Title search | 88.750 ms | 1.292 ms |

| Date sorting | 72.531 ms | 0.230 ms |

| Project and status filtering | 1.121 ms | 0.254 ms |



All three queries improved after indexing.



Note: These are observed execution times from individual EXPLAIN ANALYZE runs, not averages.



