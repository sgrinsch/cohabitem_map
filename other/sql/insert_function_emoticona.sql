DROP FUNCTION IF EXISTS insert_emoji_data(text,text,text);
--Assumes only one value being inserted

CREATE OR REPLACE FUNCTION insert_emoji_data (
    _geojson TEXT,
    _emoji TEXT,
    _comment TEXT
    )
--Has to return something in order to be used in a "SELECT" statement
RETURNS integer
AS $$
DECLARE 
    _the_geom GEOMETRY;
	--The name of your table in cartoDB
	_the_table TEXT := 'emoticona';
BEGIN
    --Convert the GeoJSON to a geometry type for insertion. 
    _the_geom := ST_SetSRID(ST_GeomFromGeoJSON(_geojson),4326); 
	

	--Executes the insert given the supplied geometry, description, and username, while protecting against SQL injection.
    EXECUTE ' INSERT INTO '||quote_ident(_the_table)||' (the_geom, emoji, comment)
            VALUES ($1, $2, $3)
            ' USING _the_geom, _emoji, _comment;
            
    RETURN 1;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER ;

--Grant access to the public user
GRANT EXECUTE ON FUNCTION insert_emoji_data(text,text,text) TO publicuser;







######################################


alter table emoticona add column created_at timestamptz not null DEFAULT now()
alter table emoticona add column updated_at timestamptz not null DEFAULT now()


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