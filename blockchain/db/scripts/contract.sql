CREATE TABLE "public".contract (
    contract_type character varying(10),
    contract_address character varying(50),
    contract_json json,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);