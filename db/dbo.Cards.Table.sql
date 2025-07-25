USE [love_game]
GO
/****** Object:  Table [dbo].[Cards]    Script Date: 05/01/2025 22:38:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Cards](
	[LevelID] [int] NOT NULL,
	[CategoryID] [int] NOT NULL,
	[CardDescription] [nvarchar](max) NOT NULL,
	[IsActive] [bit] NULL,
	[TempCardID] [int] IDENTITY(1,1) NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[Cards] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Cards]  WITH CHECK ADD  CONSTRAINT [FK_Cards_Levels] FOREIGN KEY([LevelID])
REFERENCES [dbo].[Levels] ([LevelID])
GO
ALTER TABLE [dbo].[Cards] CHECK CONSTRAINT [FK_Cards_Levels]
GO
