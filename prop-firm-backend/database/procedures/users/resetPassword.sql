CREATE PROCEDURE sp_ResetPassword
    @email VARCHAR(50),
    @password VARCHAR(255)
AS
BEGIN
    UPDATE Users
    SET password = @password
    WHERE email = @email;
END;    