DROP FUNCTION IF EXISTS insert_crowd_mapping_data2(text,text,text,text,text);
--Assumes only one value being inserted

CREATE OR REPLACE FUNCTION insert_crowd_mapping_data2 (
    _geojson TEXT,
    _comment TEXT,
    _email TEXT,
    _name TEXT,
    _title TEXT)
--Has to return something in order to be used in a "SELECT" statement
RETURNS integer
AS $$
DECLARE 
    _the_geom GEOMETRY;
	--The name of your table in cartoDB
	_the_table TEXT := 'mappeig_dibuix';
BEGIN
    --Convert the GeoJSON to a geometry type for insertion. 
    _the_geom := ST_SetSRID(ST_GeomFromGeoJSON(_geojson),4326); 
	

	--Executes the insert given the supplied geometry, description, and username, while protecting against SQL injection.
    EXECUTE ' INSERT INTO '||quote_ident(_the_table)||' (the_geom, comment, email, name, title)
            VALUES ($1, $2, $3, $4, $5)
            ' USING _the_geom, _comment, _email, _name, _title;
            
    RETURN 1;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER ;

--Grant access to the public user
GRANT EXECUTE ON FUNCTION insert_crowd_mapping_data2( text, text, text, text, text) TO publicuser;