-- Script SQL pour corriger les totaux des devis
-- À exécuter dans Supabase SQL Editor

-- 1. Corriger tous les totaux des QuoteItem
UPDATE "QuoteItem"
SET total = ROUND((quantity * "unitPrice")::numeric, 2)
WHERE ABS(total - (quantity * "unitPrice")) > 0.01;

-- 2. Recalculer les totaux des devis (subtotal, tax, total) à partir des items corrigés
WITH quote_totals AS (
  SELECT 
    q.id as quote_id,
    q."taxRate",
    COALESCE(SUM(qi.total), 0) as new_subtotal
  FROM "Quote" q
  LEFT JOIN "QuoteItem" qi ON qi."quoteId" = q.id
  GROUP BY q.id, q."taxRate"
)
UPDATE "Quote" q
SET 
  subtotal = qt.new_subtotal,
  tax = ROUND((qt.new_subtotal * (qt."taxRate" / 100))::numeric, 2),
  total = ROUND((qt.new_subtotal + (qt.new_subtotal * (qt."taxRate" / 100)))::numeric, 2)
FROM quote_totals qt
WHERE q.id = qt.quote_id;

-- 3. Vérifier qu'il n'y a plus d'erreurs
SELECT 
  COUNT(*) FILTER (WHERE ABS(total - (quantity * "unitPrice")) > 0.01) as "items_avec_erreur"
FROM "QuoteItem";

