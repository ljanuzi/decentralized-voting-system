-- To delete a OTP entry after one minute --

SELECT cron.schedule('*/1 * * * *', $$DELETE FROM otp_management WHERE created_at < now() - interval '1 minute'$$);