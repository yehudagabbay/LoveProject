USE [love_game]
GO
/****** Object:  Table [dbo].[UserCards]    Script Date: 05/01/2025 22:38:54 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserCards](
	[UserID] [int] NOT NULL,
	[CardID] [int] NOT NULL,
	[LevelID] [int] NOT NULL,
	[CategoryID] [int] NOT NULL,
 CONSTRAINT [PK_UserCards] PRIMARY KEY CLUSTERED 
(
	[UserID] ASC,
	[CardID] ASC,
	[LevelID] ASC,
	[CategoryID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[UserCards]  WITH CHECK ADD  CONSTRAINT [FK_UserCards_Users] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[UserCards] CHECK CONSTRAINT [FK_UserCards_Users]
GO
