-- שימוש בבסיס הנתונים love_game
USE love_game;
go



SELECT * FROM Categories;
SELECT * FROM Levels;
SELECT * FROM Cards;
select * from UserCard
select * from UserCards
select * from Users
go


INSERT INTO Cards (CategoryID, LevelID, CardDescription, IsActive)
VALUES 
-- כיף (6 כרטיסים)
(2, 1, N'בצעו ריקוד מצחיק יחד!', 1), 
(2, 1, N'המציאו כינוי משעשע אחד לשני.', 1), 
(2, 2, N'חיקו דמות מסרט שאתם אוהבים.', 1), 
(2, 2, N'שרו שיר שאתם זוכרים מהילדות שלכם יחד.', 1), 
(2, 3, N'המציאו סיפור מצחיק ושחקו אותו כמו הצגה.', 1), 
(2, 3, N'בנו משחק כיפי שמשלב את שניכם יחד – והדגימו אותו.', 1),

-- היכרות (6 כרטיסים)
(1, 1, N'מה המאכל האהוב עליך?', 1), 
(1, 1, N'מה היה החלום הכי מצחיק שחלמת?', 1), 
(1, 2, N'מהו הסרט או הספר שהכי השפיע עליך?', 1), 
(1, 2, N'ספרו על תקופה בחיים שבה למדתם משהו משמעותי על עצמכם.', 1), 
(1, 3, N'שתפו רגע שבו הרגשתם פגיעים ונתמכתם אחד בשני.', 1), 
(1, 3, N'מהו הפחד הכי גדול שלכם כיום?', 1),

-- תשוקה (6 כרטיסים)
(3, 1, N'מה הדבר הקטן שאתם הכי אוהבים אחד בשני?', 1), 
(3, 1, N'מהי המחמאה הכי יפה שקיבלתם אחד מהשני?', 1), 
(3, 2, N'מהו זיכרון רומנטי שגורם לכם להתרגש מחדש?', 1), 
(3, 2, N'תכננו יחד ערב רומנטי מהחלומות.', 1), 
(3, 3, N'שתפו פנטזיה רומנטית שהייתם רוצים להגשים יחד.', 1), 
(3, 3, N'איך אתם רואים את מערכת היחסים שלכם מתקדמת בשנה הקרובה מבחינת תשוקה ואינטימיות?', 1);
go
ALTER TABLE Cards
ADD CardID INT IDENTITY(1,1) PRIMARY KEY;


SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS
ORDER BY TABLE_NAME, ORDINAL_POSITION;
go

EXEC sp_help 'TableName'; -- שנה את שם הטבלה לכל טבלה בבסיס הנתונים
go