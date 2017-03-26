DROP FUNCTION IF EXISTS insert_crowd_mapping_data(text,text,text,text,text,text,text,text,text,text,text);
--Assumes only one value being inserted

CREATE OR REPLACE FUNCTION insert_crowd_mapping_data (
    _geojson TEXT,
    _address TEXT,
    _address2 TEXT,
    _catastral TEXT,
    _city TEXT,
    _comment TEXT,
    _email TEXT,
    _name TEXT,
    _postal TEXT,
    _region TEXT,
    _type TEXT
    )
--Has to return something in order to be used in a "SELECT" statement
RETURNS integer
AS $$
DECLARE 
    _the_geom GEOMETRY;
	--The name of your table in cartoDB
	_the_table TEXT := 'mappeig_2';
BEGIN
    --Convert the GeoJSON to a geometry type for insertion. 
    _the_geom := ST_SetSRID(ST_GeomFromGeoJSON(_geojson),4326); 
	

	--Executes the insert given the supplied geometry, description, and username, while protecting against SQL injection.
    EXECUTE ' INSERT INTO '||quote_ident(_the_table)||' (the_geom, address, address2, catastral, city, comment, email, name, postal, region, type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ' USING _the_geom, _address, _address2, _catastral, _city, _comment, _email, _name, _postal, _region, _type;
            
    RETURN 1;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER ;

--Grant access to the public user
GRANT EXECUTE ON FUNCTION insert_crowd_mapping_data(text,text,text,text,text,text,text,text,text,text,text) TO publicuser;







######################################


alter table mappeig_2 add column created_at timestamptz not null DEFAULT now()
alter table mappeig_2 add column updated_at timestamptz not null DEFAULT now()


CREATE OR REPLACE FUNCTION _update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at := now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;


CREATE trigger update_updated_at_trigger 
BEFORE UPDATE ON mappeig_2 
FOR EACH ROW 
EXECUTE PROCEDURE _update_updated_at()