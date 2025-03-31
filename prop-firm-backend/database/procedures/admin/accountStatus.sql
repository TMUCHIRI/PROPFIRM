CREATE PROCEDURE sp_AccountStatus
    @id UNIQUEIDENTIFIER,
    @isActive BIT
AS
BEGIN
    UPDATE Users
    SET isActive = @isActive
    WHERE id = @id;
END;
