ALTER TABLE reviews
ADD CONSTRAINT reviews_inv_id_fkey
FOREIGN KEY (inv_id)
REFERENCES inventory(inv_id)
ON DELETE CASCADE;

ALTER TABLE reviews
ADD CONSTRAINT reviews_account_id_fkey
FOREIGN KEY (account_id)
REFERENCES account(account_id)
ON DELETE CASCADE;
