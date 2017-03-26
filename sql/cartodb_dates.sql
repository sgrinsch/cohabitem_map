alter table mappeig_dibuix add column created_at timestamptz not null DEFAULT now()
alter table mappeig_dibuix add column updated_at timestamptz not null DEFAULT now()




CREATE OR REPLACE FUNCTION _update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at := now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;



CREATE trigger update_updated_at_trigger 
BEFORE UPDATE ON mappeig_dibuix 
FOR EACH ROW 
EXECUTE PROCEDURE _update_updated_at()



/////https://carto.com/docs/tips-and-tricks/data-types