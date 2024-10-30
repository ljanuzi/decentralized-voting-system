-- At present these are created manually in editor. For tracking purpose the scripts are in repo --
-- Later can be automated using migration tools --

CREATE TABLE public."otp_management"
(
    public_key character varying(200),
    message_sid character varying(50),
    otp character varying(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)