CREATE POLICY "card images read" ON storage.objects FOR SELECT USING (bucket_id IN ('card-art','card-backs'));
CREATE POLICY "card images insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('card-art','card-backs'));
CREATE POLICY "card images update" ON storage.objects FOR UPDATE USING (bucket_id IN ('card-art','card-backs')) WITH CHECK (bucket_id IN ('card-art','card-backs'));
CREATE POLICY "card images delete" ON storage.objects FOR DELETE USING (bucket_id IN ('card-art','card-backs'));