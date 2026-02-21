-- Créer des politiques RLS pour permettre la lecture publique des données référentielles
-- Ces tables doivent être lisibles par tous les utilisateurs authentifiés

-- Corps
DROP POLICY IF EXISTS "Anyone authenticated can view corps" ON corps;
CREATE POLICY "Anyone authenticated can view corps" 
ON corps FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Grades
DROP POLICY IF EXISTS "Anyone authenticated can view grades" ON grades;
CREATE POLICY "Anyone authenticated can view grades" 
ON grades FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Échelles
DROP POLICY IF EXISTS "Anyone authenticated can view echelles" ON echelles;
CREATE POLICY "Anyone authenticated can view echelles" 
ON echelles FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Échelons
DROP POLICY IF EXISTS "Anyone authenticated can view echelons" ON echelons;
CREATE POLICY "Anyone authenticated can view echelons" 
ON echelons FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Postes
DROP POLICY IF EXISTS "Anyone authenticated can view postes" ON postes;
CREATE POLICY "Anyone authenticated can view postes" 
ON postes FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Ministères
DROP POLICY IF EXISTS "Anyone authenticated can view ministeres" ON ministeres;
CREATE POLICY "Anyone authenticated can view ministeres" 
ON ministeres FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Types de documents
DROP POLICY IF EXISTS "Anyone authenticated can view types_documents" ON types_documents;
CREATE POLICY "Anyone authenticated can view types_documents" 
ON types_documents FOR SELECT 
USING (auth.uid() IS NOT NULL);